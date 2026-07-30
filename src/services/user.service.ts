import bcrypt from "bcrypt";
import prisma from "../prisma/client";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors";
import { CreateUserInput, UpdateUserInput } from "../validators/user.validation";
import ImageService from "./image.service";

const publicUserSelect = {
  id: true,
  username: true,
  firstName: true,
  lastName: true,
  email: true,
  phoneNo: true,
  profilePicture: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function getUsers() {
  return { data: await prisma.user.findMany({ select: publicUserSelect, orderBy: { createdAt: "asc" } }) };
}

async function createUser(input: CreateUserInput, actorRole: string) {
  if (actorRole === "admin" && input.role !== "buyer") {
    throw new ForbiddenError("Admins can create buyer accounts only");
  }
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: input.email }, ...(input.phoneNo ? [{ phoneNo: input.phoneNo }] : [])] },
  });
  if (existing) throw new BadRequestError("A user with this email or phone number already exists");

  const password = await bcrypt.hash(input.password, 12);
  const data = await prisma.user.create({ data: { ...input, password }, select: publicUserSelect });
  return { data };
}

async function updateUser(userId: string, input: UpdateUserInput, actorId: string, actorRole: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");
  if (actorRole === "admin" && (user.role !== "buyer" || (input.role && input.role !== "buyer"))) {
    throw new ForbiddenError("Admins can manage buyer accounts only");
  }
  if (userId === actorId && ((input.role && input.role !== user.role) || input.isActive === false)) {
    throw new BadRequestError("You cannot change your own role or disable your own account");
  }

  if (input.email || input.phoneNo) {
    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: userId },
        OR: [...(input.email ? [{ email: input.email }] : []), ...(input.phoneNo ? [{ phoneNo: input.phoneNo }] : [])],
      },
    });
    if (duplicate) throw new BadRequestError("A user with this email or phone number already exists");
  }

  const { password: plainPassword, ...fields } = input;
  const data = await prisma.user.update({
    where: { id: userId },
    data: { ...fields, password: plainPassword ? await bcrypt.hash(plainPassword, 12) : undefined },
    select: publicUserSelect,
  });
  return { data };
}

async function deleteUser(userId: string, actorId: string, actorRole: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");
  if (userId === actorId) throw new BadRequestError("You cannot delete your own account");
  if (actorRole === "admin" && user.role !== "buyer") {
    throw new ForbiddenError("Admins can delete buyer accounts only");
  }
  if (await prisma.order.count({ where: { userId } })) {
    throw new BadRequestError("Users with order history cannot be deleted; disable the account instead");
  }
  const data = await prisma.user.delete({ where: { id: userId }, select: publicUserSelect });
  await ImageService.deleteImageByUrl(user.profilePicture).catch(() => undefined);
  return { data };
}

async function updateProfileImage(userId: string, file: Express.Multer.File) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  const uploaded = await ImageService.uploadImage(file, "profiles");
  try {
    const data = await prisma.user.update({
      where: { id: userId }, data: { profilePicture: uploaded.url }, select: publicUserSelect,
    });
    await ImageService.deleteImageByUrl(user.profilePicture).catch(() => undefined);
    return { data };
  } catch (error) {
    await ImageService.deleteImage(uploaded.key).catch(() => undefined);
    throw error;
  }
}

export default { getUsers, createUser, updateUser, deleteUser, updateProfileImage };
