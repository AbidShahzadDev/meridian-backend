import "dotenv/config";
import dns from "node:dns";
import mongoose from "mongoose";
import prisma from "../prisma/client";

type MongoRecord = Record<string, any> & { _id: { toString(): string } };
const asDate = (value: unknown) => value ? new Date(value as string | number | Date) : new Date();

async function migrate() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DATABASE || "backend_test" });
  const db = mongoose.connection.db;
  if (!db) throw new Error("MongoDB connection has no database");

  const [users, categories, brands, products] = await Promise.all([
    db.collection("users").find({}).toArray() as Promise<MongoRecord[]>,
    db.collection("categories").find({}).toArray() as Promise<MongoRecord[]>,
    db.collection("brands").find({}).toArray() as Promise<MongoRecord[]>,
    db.collection("products").find({}).toArray() as Promise<MongoRecord[]>,
  ]);

  await prisma.$transaction(async (tx) => {
    for (const user of users) {
      await tx.user.upsert({
        where: { id: user._id.toString() },
        update: {},
        create: {
          id: user._id.toString(), username: user.username, firstName: user.firstName,
          lastName: user.lastName, email: String(user.email).toLowerCase(), password: user.password ?? null,
          phoneNo: user.phoneNo ?? null, profilePicture: user.profilePicture ?? null,
          role: user.role ?? "buyer", isActive: user.isActive ?? true,
          createdAt: asDate(user.created_at), updatedAt: asDate(user.updated_at),
        },
      });
    }
    for (const category of categories) {
      await tx.category.upsert({
        where: { id: category._id.toString() }, update: {},
        create: {
          id: category._id.toString(), name: category.name, slug: category.slug,
          image: category.image ?? null, description: category.description ?? null,
          parentId: category.parentId?.toString() ?? null, status: category.status ?? "active",
          createdAt: asDate(category.createdAt ?? category.created_at), updatedAt: asDate(category.updatedAt ?? category.updated_at),
        },
      });
    }
    for (const brand of brands) {
      await tx.brand.upsert({
        where: { id: brand._id.toString() }, update: {},
        create: {
          id: brand._id.toString(), name: brand.name, slug: brand.slug, logo: brand.logo ?? null,
          status: brand.status ?? "active", createdAt: asDate(brand.createdAt ?? brand.created_at),
          updatedAt: asDate(brand.updatedAt ?? brand.updated_at),
        },
      });
    }
    for (const product of products) {
      await tx.product.upsert({
        where: { id: product._id.toString() }, update: {},
        create: {
          id: product._id.toString(), title: product.title, slug: product.slug,
          description: product.description ?? null, shortDescription: product.shortDescription ?? null,
          sku: product.sku ?? null, barcode: product.barcode ?? null,
          categoryId: product.categoryId?.toString() ?? null, brandId: product.brandId?.toString() ?? null,
          price: Number(product.price), salePrice: product.salePrice == null ? null : Number(product.salePrice),
          stock: Number(product.stock ?? 0), weight: product.weight == null ? null : Number(product.weight),
          dimensions: product.dimensions ?? null, featuredImage: product.featuredImage ?? null,
          gallery: product.gallery ?? [], status: product.status ?? "active", isFeatured: product.isFeatured ?? false,
          createdAt: asDate(product.createdAt ?? product.created_at), updatedAt: asDate(product.updatedAt ?? product.updated_at),
        },
      });
    }
  }, { timeout: 120000 });

  const target = await Promise.all([
    prisma.user.count(), prisma.category.count(), prisma.brand.count(), prisma.product.count(),
  ]);
  console.log(JSON.stringify({
    source: { users: users.length, categories: categories.length, brands: brands.length, products: products.length },
    target: { users: target[0], categories: target[1], brands: target[2], products: target[3] },
  }, null, 2));
}

migrate()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => { await mongoose.disconnect(); await prisma.$disconnect(); });
