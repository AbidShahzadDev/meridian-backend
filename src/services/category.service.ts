import prisma from "../prisma/client";
import { BadRequestError, NotFoundError } from "../errors";
import { CreateCategoryInput, UpdateCategoryInput } from "../validators/category.validation";
import { slugify } from "../utils/slugify";

async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new BadRequestError("Category with this name already exists");
  }

  const slug = slugify(input.name, { lower: true, strict: true });
  const category = await prisma.category.create({
    data: {
      name: input.name,
      slug,
      image: input.image,
      description: input.description,
      parentId: input.parentId,
      status: input.status ?? "active",
    },
  });

  return { data: category };
}

async function getCategories() {
  const categories = await prisma.category.findMany({ orderBy: { createdAt: "desc" } });
  return { data: categories };
}

async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Category not found");
  return { data: category };
}

async function updateCategory(id: string, input: UpdateCategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Category not found");

  if (input.name) {
    const existing = await prisma.category.findUnique({ where: { name: input.name } });
    if (existing && existing.id !== id) {
      throw new BadRequestError("Category with this name already exists");
    }
  }

  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug: input.name ? slugify(input.name, { lower: true, strict: true }) : undefined,
      image: input.image,
      description: input.description,
      parentId: input.parentId,
      status: input.status,
    },
  });

  return { data: updated };
}

async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new NotFoundError("Category not found");
  await prisma.category.delete({ where: { id } });
  return { data: category };
}

export default { createCategory, getCategories, getCategoryById, updateCategory, deleteCategory };