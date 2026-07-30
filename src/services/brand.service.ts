import prisma from "../prisma/client";
import { BadRequestError, NotFoundError } from "../errors";
import { CreateBrandInput, UpdateBrandInput } from "../validators/brand.validation";
import { slugify } from "../utils/slugify";

async function createBrand(input: CreateBrandInput) {
  const existing = await prisma.brand.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new BadRequestError("Brand with this name already exists");
  }

  const slug = slugify(input.name, { lower: true, strict: true });
  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      slug,
      logo: input.logo,
      status: input.status ?? "active",
    },
  });

  return { data: brand };
}

async function getBrands() {
  const brands = await prisma.brand.findMany({ orderBy: { createdAt: "desc" } });
  return { data: brands };
}

async function getBrandById(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new NotFoundError("Brand not found");
  return { data: brand };
}

async function updateBrand(id: string, input: UpdateBrandInput) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new NotFoundError("Brand not found");

  if (input.name) {
    const existing = await prisma.brand.findUnique({ where: { name: input.name } });
    if (existing && existing.id !== id) {
      throw new BadRequestError("Brand with this name already exists");
    }
  }

  const updated = await prisma.brand.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.name ? slugify(input.name, { lower: true, strict: true }) : undefined,
      logo: input.logo,
      status: input.status,
    },
  });

  return { data: updated };
}

async function deleteBrand(id: string) {
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) throw new NotFoundError("Brand not found");
  await prisma.brand.delete({ where: { id } });
  return { data: brand };
}

export default { createBrand, getBrands, getBrandById, updateBrand, deleteBrand }; 