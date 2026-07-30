import "dotenv/config";
import bcrypt from "bcrypt";
import prisma from "../prisma/client";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 characters) in .env");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, role: "super_admin", isActive: true },
    create: {
      email, password: passwordHash, username: "superadmin", firstName: "Super",
      lastName: "Admin", role: "super_admin", isActive: true,
    },
  });
  console.log(`Seeded super admin: ${email}`);
}

seedAdmin()
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
