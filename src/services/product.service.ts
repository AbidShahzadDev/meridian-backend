import prisma from "../prisma/client";
import { BadRequestError, NotFoundError } from "../errors";
import { CreateProductInput, UpdateProductInput } from "../validators/product.validation";
import { slugify } from "../utils/slugify";
import ImageService from "./image.service";
import NotificationService from "./notification.service";

function buildProductQuery(query: any) {
  const filters: any = {};
  const orderBy: any = {};

  if (query.search) {
    filters.OR = [
      { title: { contains: String(query.search), mode: "insensitive" } },
      { description: { contains: String(query.search), mode: "insensitive" } },
      { shortDescription: { contains: String(query.search), mode: "insensitive" } },
    ];
  }

  if (query.categoryId) filters.categoryId = String(query.categoryId);
  if (query.brandId) filters.brandId = String(query.brandId);
  if (query.status) filters.status = String(query.status);
  if (query.isFeatured) filters.isFeatured = query.isFeatured === "true";
  if (query.minPrice) filters.price = { gte: Number(query.minPrice) };
  if (query.maxPrice) {
    filters.price = { ...filters.price, lte: Number(query.maxPrice) };
  }

  const sortField = String(query.sort || "createdAt");
  const sortOrder = String(query.order || "desc");
  orderBy[sortField] = sortOrder as "asc" | "desc";

  return { filters, orderBy };
}

async function createProduct(input: CreateProductInput) {
  const slug = slugify(input.title, { lower: true, strict: true });
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    throw new BadRequestError("Product with this slug already exists");
  }

  const product = await prisma.product.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      sku: input.sku,
      barcode: input.barcode,
      categoryId: input.categoryId,
      brandId: input.brandId,
      price: input.price,
      salePrice: input.salePrice,
      stock: input.stock,
      weight: input.weight,
      dimensions: input.dimensions,
      featuredImage: input.featuredImage,
      gallery: input.gallery ?? [],
      status: input.status ?? "active",
      isFeatured: input.isFeatured ?? false,
    },
  });

  await NotificationService.notifyAllActiveUsers({
    type: "product_created",
    title: "New product available",
    body: `${product.title} is now available in our store.`,
    data: { productId: product.id, productSlug: product.slug },
  }).catch((error) => console.error("Unable to notify users about new product:", error));

  return { data: product };
}

async function getProducts(query: any) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);
  const skip = (page - 1) * limit;

  const { filters, orderBy } = buildProductQuery(query);

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: filters,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where: filters }),
  ]);

  return {
    data: {
      items: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  };
}

async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Product not found");
  return { data: product };
}

async function updateProduct(id: string, input: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Product not found");

  if (input.title) {
    const slug = slugify(input.title, { lower: true, strict: true });
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      throw new BadRequestError("Product with this slug already exists");
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.title ? slugify(input.title, { lower: true, strict: true }) : undefined,
      description: input.description,
      shortDescription: input.shortDescription,
      sku: input.sku,
      barcode: input.barcode,
      categoryId: input.categoryId,
      brandId: input.brandId,
      price: input.price,
      salePrice: input.salePrice,
      stock: input.stock,
      weight: input.weight,
      dimensions: input.dimensions,
      featuredImage: input.featuredImage,
      gallery: input.gallery,
      status: input.status,
      isFeatured: input.isFeatured,
    },
  });

  return { data: updated };
}

async function deleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Product not found");
  if (await prisma.orderItem.count({ where: { productId: id } })) {
    throw new BadRequestError("Products with order history cannot be deleted; set the product status to inactive instead");
  }
  await prisma.product.delete({ where: { id } });
  await Promise.all([
    ImageService.deleteImageByUrl(product.featuredImage).catch(() => undefined),
    ...product.gallery.map((url) => ImageService.deleteImageByUrl(url).catch(() => undefined)),
  ]);
  return { data: product };
}

async function updateProductImages(
  id: string,
  files: { featuredImage?: Express.Multer.File[]; gallery?: Express.Multer.File[] },
  replaceGallery: boolean
) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new NotFoundError("Product not found");

  const featuredFile = files.featuredImage?.[0];
  const galleryFiles = files.gallery ?? [];
  if (!featuredFile && galleryFiles.length === 0) throw new BadRequestError("Upload at least one product image");

  const uploaded: { key: string; url: string }[] = [];
  try {
    if (featuredFile) uploaded.push(await ImageService.uploadImage(featuredFile, "products"));
    for (const file of galleryFiles) uploaded.push(await ImageService.uploadImage(file, "products"));

    const featuredImage = featuredFile ? uploaded[0].url : product.featuredImage;
    const galleryStart = featuredFile ? 1 : 0;
    const newGallery = uploaded.slice(galleryStart).map((image) => image.url);
    const gallery = replaceGallery ? newGallery : [...product.gallery, ...newGallery];
    const data = await prisma.product.update({ where: { id }, data: { featuredImage, gallery } });

    if (featuredFile) await ImageService.deleteImageByUrl(product.featuredImage).catch(() => undefined);
    if (replaceGallery) {
      await Promise.all(product.gallery.map((url) => ImageService.deleteImageByUrl(url).catch(() => undefined)));
    }
    return { data };
  } catch (error) {
    await Promise.all(uploaded.map((image) => ImageService.deleteImage(image.key).catch(() => undefined)));
    throw error;
  }
}

export default { createProduct, getProducts, getProductById, updateProduct, deleteProduct, updateProductImages };
