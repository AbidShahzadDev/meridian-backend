import bcrypt from "bcrypt";
import { AuthInput, ChangePasswordInput, LoginInput, ResendRegistrationOTPInput, VerifyOTPInput } from "../validators/auth.validation";
import prisma from "../prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors";
import { generateJWTPair, verifyRefreshJWT } from "../utils/generateJWT";
import { generateOTP } from "../utils/generateOTP";
import { sendLoginCode } from "./mail.service";
import { sendEmailOTP, verifyEmailOTP } from "./supabase-auth.service";

const publicUserSelect = {
  id: true, username: true, firstName: true, lastName: true, email: true,
  phoneNo: true, profilePicture: true, role: true, isActive: true,
  createdAt: true, updatedAt: true,
} as const;

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;

function localOtpEnabled() {
  return process.env.AUTH_EMAIL_PROVIDER !== "supabase"
    && ["development", "test"].includes(process.env.NODE_ENV || "")
    && process.env.LOCAL_AUTH_OTP === "000000";
}

function supabaseOtpEnabled() {
  return process.env.AUTH_EMAIL_PROVIDER === "supabase";
}

async function sendRegistrationOTP(email: string) {
  if (supabaseOtpEnabled()) {
    await sendEmailOTP(email);
    return;
  }
  await sendLoginCode(email, generateOTP(6), "registration");
}

async function register(input: AuthInput) {
  if (await prisma.user.findUnique({ where: { email: input.email } })) {
    throw new BadRequestError("User with this email already exists");
  }
  const pending = await prisma.emailVerification.findUnique({ where: { email: input.email } });
  if (pending && Date.now() - pending.updatedAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw new BadRequestError("A verification code was already sent. Please wait before requesting another code.");
  }

  const local = localOtpEnabled();
  const supabase = supabaseOtpEnabled();
  const otp = local ? "000000" : generateOTP(6);
  if (!local && supabase) await sendRegistrationOTP(input.email);
  if (!local && !supabase) await sendLoginCode(input.email, otp, "registration");
  const [passwordHash, otpHash] = await Promise.all([bcrypt.hash(input.password, 12), bcrypt.hash(otp, 10)]);
  await prisma.emailVerification.upsert({
    where: { email: input.email },
    update: {
      username: input.username, firstName: input.firstName, lastName: input.lastName, phoneNo: input.phoneNo,
      profilePicture: input.profilePicture, passwordHash, otpHash: supabase ? "supabase-managed" : otpHash, attempts: 0,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
    create: {
      email: input.email, username: input.username, firstName: input.firstName, lastName: input.lastName,
      phoneNo: input.phoneNo, profilePicture: input.profilePicture, passwordHash, otpHash: supabase ? "supabase-managed" : otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    },
  });
  return { data: { email: input.email, verificationRequired: true, expiresInSeconds: OTP_EXPIRY_MS / 1000 }, message: local ? "Development OTP is 000000" : "Verification code sent to your email" };
}

async function resendRegistrationOTP(input: ResendRegistrationOTPInput) {
  const pending = await prisma.emailVerification.findUnique({ where: { email: input.email } });
  if (!pending) throw new BadRequestError("No pending registration was found for this email");
  if (Date.now() - pending.updatedAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
    throw new BadRequestError("Please wait before requesting another verification code");
  }
  const local = localOtpEnabled();
  const supabase = supabaseOtpEnabled();
  const otp = local ? "000000" : generateOTP(6);
  if (!local && supabase) await sendRegistrationOTP(input.email);
  if (!local && !supabase) await sendLoginCode(input.email, otp, "registration");
  await prisma.emailVerification.update({
    where: { email: input.email },
    data: { otpHash: supabase ? "supabase-managed" : await bcrypt.hash(otp, 10), attempts: 0, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) },
  });
  return { data: { email: input.email, verificationRequired: true, expiresInSeconds: OTP_EXPIRY_MS / 1000 }, message: local ? "Development OTP is 000000" : "A new verification code was sent" };
}

async function verifyRegistration(input: VerifyOTPInput) {
  const pending = await prisma.emailVerification.findUnique({ where: { email: input.email } });
  if (!pending || pending.expiresAt.getTime() <= Date.now()) {
    if (pending) await prisma.emailVerification.delete({ where: { id: pending.id } });
    throw new UnauthorizedError("Invalid or expired verification code");
  }
  if (pending.attempts >= OTP_MAX_ATTEMPTS) throw new UnauthorizedError("Too many attempts. Request a new verification code");

  const otpMatches = localOtpEnabled()
    ? input.otp === "000000"
    : supabaseOtpEnabled()
      ? await verifyEmailOTP(input.email, input.otp).then(() => true).catch(() => false)
      : await bcrypt.compare(input.otp, pending.otpHash);
  if (!otpMatches) {
    const attempts = pending.attempts + 1;
    await prisma.emailVerification.update({ where: { id: pending.id }, data: { attempts } });
    throw new UnauthorizedError(attempts >= OTP_MAX_ATTEMPTS
      ? "Too many attempts. Request a new verification code"
      : "Invalid verification code");
  }

  try {
    const data = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: pending.email, username: pending.username, firstName: pending.firstName, lastName: pending.lastName,
          phoneNo: pending.phoneNo, profilePicture: pending.profilePicture, password: pending.passwordHash,
          role: "buyer", isActive: true,
        },
        select: publicUserSelect,
      });
      await tx.emailVerification.delete({ where: { id: pending.id } });
      return user;
    });
    return { data: { user: data, ...generateJWTPair({ id: data.id, role: data.role }) }, message: "Email verified and account created successfully" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new BadRequestError("User with this email already exists");
    }
    throw error;
  }
}

async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user?.password || !(await bcrypt.compare(input.password, user.password))) {
    throw new UnauthorizedError("Invalid email or password");
  }
  if (!user.isActive) throw new ForbiddenError("This account is disabled");
  const { password: _password, ...safeUser } = user;
  return { data: { user: safeUser, ...generateJWTPair({ id: user.id, role: user.role }) } };
}

async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: publicUserSelect });
  if (!user) throw new NotFoundError("User not found");
  if (!user.isActive) throw new ForbiddenError("This account is disabled");
  return { data: user };
}

async function refresh(refreshToken: string) {
  let payload;
  try { payload = verifyRefreshJWT(refreshToken); }
  catch { throw new UnauthorizedError("Invalid or expired refresh token"); }
  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user?.isActive) throw new UnauthorizedError("Invalid refresh token");
  return { data: generateJWTPair({ id: user.id, role: user.role }) };
}

async function changePassword(userId: string, input: ChangePasswordInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.password) throw new NotFoundError("User not found");
  if (!user.isActive) throw new ForbiddenError("This account is disabled");
  if (!(await bcrypt.compare(input.currentPassword, user.password))) {
    throw new UnauthorizedError("Current password is incorrect");
  }
  await prisma.user.update({
    where: { id: userId },
    data: { password: await bcrypt.hash(input.newPassword, 12) },
  });
  return { success: true, message: "Password updated successfully. Please sign in again on other devices." };
}

export default { register, resendRegistrationOTP, verifyRegistration, login, getCurrentUser, refresh, changePassword };
