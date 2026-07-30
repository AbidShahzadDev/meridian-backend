import "dotenv/config";
import prisma from "../prisma/client";

type SeedProduct = {
  title: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number;
  stock: number;
  weight: number;
  dimensions: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode: string;
  featuredImage: string;
  gallery: string[];
  isFeatured: boolean;
};

const image = (slug: string) => `https://images.unsplash.com/photo-${slug}?auto=format&fit=crop&w=900&q=80`;

const products: SeedProduct[] = [
  { title: "Amber Glow Soy Candle", category: "Candles", brand: "LumiScents", price: 2499, salePrice: 1999, stock: 42, weight: 0.35, dimensions: "8 x 8 x 10 cm", description: "A warm amber and vanilla soy candle in a reusable glass jar.", shortDescription: "Warm amber and vanilla soy candle.", sku: "LS-CND-001", barcode: "8901000000011", featuredImage: image("1603006905003-be475563bc59"), gallery: [image("1603006905003-be475563bc59")], isFeatured: true },
  { title: "Lavender Calm Candle Set", category: "Candles", brand: "GlowAura", price: 3299, salePrice: 2799, stock: 28, weight: 0.5, dimensions: "18 x 12 x 7 cm", description: "Three hand-poured lavender candles designed for a relaxing evening.", shortDescription: "Three-piece lavender relaxation candle set.", sku: "GA-CND-002", barcode: "8901000000028", featuredImage: image("1603006905003-be475563bc59"), gallery: [image("1603006905003-be475563bc59")], isFeatured: false },
  { title: "Cedarwood Travel Candle", category: "Candles", brand: "BrightNest", price: 1599, salePrice: 1299, stock: 65, weight: 0.22, dimensions: "7 x 7 x 6 cm", description: "A compact cedarwood candle with a clean, earthy fragrance.", shortDescription: "Compact earthy cedarwood candle.", sku: "BN-CND-003", barcode: "8901000000035", featuredImage: image("1603006905003-be475563bc59"), gallery: [image("1603006905003-be475563bc59")], isFeatured: false },
  { title: "Citrus Morning Candle", category: "Candles", brand: "LumiHome", price: 1899, salePrice: 0, stock: 36, weight: 0.3, dimensions: "8 x 8 x 9 cm", description: "Bright citrus notes that bring a fresh morning feeling to any room.", shortDescription: "Fresh citrus candle for everyday spaces.", sku: "LH-CND-004", barcode: "8901000000042", featuredImage: image("1603006905003-be475563bc59"), gallery: [image("1603006905003-be475563bc59")], isFeatured: false },
  { title: "Minimalist Oak Wall Clock", category: "Clock", brand: "ChronoCraft", price: 5499, salePrice: 4699, stock: 18, weight: 0.9, dimensions: "35 x 35 x 5 cm", description: "A silent minimalist wall clock with a natural oak face and clean hands.", shortDescription: "Silent natural oak minimalist wall clock.", sku: "CC-CLK-001", barcode: "8901000000059", featuredImage: image("1501139083538-0139583c060f"), gallery: [image("1501139083538-0139583c060f")], isFeatured: true },
  { title: "Brass Accent Table Clock", category: "Clock", brand: "TickTock", price: 3999, salePrice: 3499, stock: 24, weight: 0.65, dimensions: "18 x 12 x 8 cm", description: "A compact brass accent clock for desks, shelves, and bedside tables.", shortDescription: "Elegant brass desk clock.", sku: "TT-CLK-002", barcode: "8901000000066", featuredImage: image("1501139083538-0139583c060f"), gallery: [image("1501139083538-0139583c060f")], isFeatured: false },
  { title: "Midnight Silent Wall Clock", category: "Clock", brand: "ChronoCraft", price: 4799, salePrice: 0, stock: 15, weight: 0.8, dimensions: "32 x 32 x 4 cm", description: "A modern charcoal clock with a silent movement and high-contrast dial.", shortDescription: "Modern charcoal silent wall clock.", sku: "CC-CLK-003", barcode: "8901000000073", featuredImage: image("1501139083538-0139583c060f"), gallery: [image("1501139083538-0139583c060f")], isFeatured: false },
  { title: "Kids Rainbow Learning Clock", category: "Clock", brand: "BrightNest", price: 2899, salePrice: 2399, stock: 31, weight: 0.55, dimensions: "28 x 28 x 4 cm", description: "A colorful educational clock that helps children learn time in a playful way.", shortDescription: "Colorful educational clock for children.", sku: "BN-CLK-004", barcode: "8901000000080", featuredImage: image("1499750310107-5fef28a66643"), gallery: [image("1499750310107-5fef28a66643")], isFeatured: false },
  { title: "Luna Glass Table Lamp", category: "Lamps", brand: "LumiHome", price: 6999, salePrice: 5999, stock: 20, weight: 1.4, dimensions: "22 x 22 x 38 cm", description: "A soft-glow glass table lamp with a brushed metal base.", shortDescription: "Soft-glow glass table lamp.", sku: "LH-LMP-001", barcode: "8901000000097", featuredImage: image("1507473885765-e6ed057f782c"), gallery: [image("1507473885765-e6ed057f782c")], isFeatured: true },
  { title: "Nordic Arc Floor Lamp", category: "Lamps", brand: "BrightNest", price: 12999, salePrice: 10999, stock: 10, weight: 4.8, dimensions: "45 x 30 x 160 cm", description: "A tall arc floor lamp with a warm adjustable light for reading corners.", shortDescription: "Warm adjustable arc floor lamp.", sku: "BN-LMP-002", barcode: "8901000000103", featuredImage: image("1524484485831-a92ffc0de03f"), gallery: [image("1524484485831-a92ffc0de03f")], isFeatured: true },
  { title: "Woven Pendant Lamp", category: "Lamps", brand: "GlowAura", price: 8499, salePrice: 7499, stock: 14, weight: 1.8, dimensions: "42 x 42 x 28 cm", description: "A hand-woven pendant shade that creates a warm patterned glow.", shortDescription: "Hand-woven pendant light shade.", sku: "GA-LMP-003", barcode: "8901000000110", featuredImage: image("1524758631624-e2822e304c36"), gallery: [image("1524758631624-e2822e304c36")], isFeatured: false },
  { title: "Brass Reading Sconce", category: "Lamps", brand: "LumiHome", price: 5799, salePrice: 0, stock: 22, weight: 0.9, dimensions: "18 x 12 x 24 cm", description: "A directional brass wall sconce for focused reading and bedside lighting.", shortDescription: "Directional brass reading wall light.", sku: "LH-LMP-004", barcode: "8901000000127", featuredImage: image("1540932239986-30128078f3c5"), gallery: [image("1540932239986-30128078f3c5")], isFeatured: false },
  { title: "Round Walnut Mirror", category: "Mirrors", brand: "Reflecta", price: 8999, salePrice: 7999, stock: 12, weight: 3.2, dimensions: "70 x 70 x 4 cm", description: "A round walnut-framed mirror that adds warmth to hallways and bedrooms.", shortDescription: "Warm walnut-framed round mirror.", sku: "RF-MIR-001", barcode: "8901000000134", featuredImage: "https://placehold.co/900x900/e8e0d5/333333?text=Round+Walnut+Mirror", gallery: ["https://placehold.co/900x900/e8e0d5/333333?text=Round+Walnut+Mirror"], isFeatured: true },
  { title: "Arched Entryway Mirror", category: "Mirrors", brand: "ArtVista", price: 14999, salePrice: 12999, stock: 7, weight: 8.5, dimensions: "60 x 150 x 5 cm", description: "A full-length arched mirror with a slim matte-black frame.", shortDescription: "Full-length arched entryway mirror.", sku: "AV-MIR-002", barcode: "8901000000141", featuredImage: "https://placehold.co/900x900/e8e0d5/333333?text=Arched+Entryway+Mirror", gallery: ["https://placehold.co/900x900/e8e0d5/333333?text=Arched+Entryway+Mirror"], isFeatured: true },
  { title: "Geometric Hexagon Mirror", category: "Mirrors", brand: "Reflecta", price: 6499, salePrice: 5499, stock: 16, weight: 2.1, dimensions: "58 x 50 x 4 cm", description: "A six-sided decorative mirror for modern gallery walls.", shortDescription: "Modern hexagon decorative mirror.", sku: "RF-MIR-003", barcode: "8901000000158", featuredImage: "https://placehold.co/900x900/e8e0d5/333333?text=Geometric+Mirror", gallery: ["https://placehold.co/900x900/e8e0d5/333333?text=Geometric+Mirror"], isFeatured: false },
  { title: "Rattan Sunburst Mirror", category: "Mirrors", brand: "ArtVista", price: 7499, salePrice: 0, stock: 9, weight: 1.7, dimensions: "65 x 65 x 6 cm", description: "A handcrafted rattan sunburst mirror with a relaxed natural finish.", shortDescription: "Handcrafted natural rattan mirror.", sku: "AV-MIR-004", barcode: "8901000000165", featuredImage: "https://placehold.co/900x900/e8e0d5/333333?text=Rattan+Mirror", gallery: ["https://placehold.co/900x900/e8e0d5/333333?text=Rattan+Mirror"], isFeatured: false },
  { title: "Botanical Lines Print", category: "Wall Art", brand: "ArtVista", price: 3599, salePrice: 2999, stock: 40, weight: 0.8, dimensions: "50 x 70 x 3 cm", description: "A calming botanical line print on textured archival paper.", shortDescription: "Calming botanical line wall print.", sku: "AV-WA-001", barcode: "8901000000172", featuredImage: image("1577083288073-40892c0860a4"), gallery: [image("1577083288073-40892c0860a4")], isFeatured: true },
  { title: "Abstract Terracotta Canvas", category: "Wall Art", brand: "ArtVista", price: 5999, salePrice: 4999, stock: 19, weight: 1.6, dimensions: "60 x 80 x 4 cm", description: "A textured abstract canvas in terracotta, cream, and charcoal tones.", shortDescription: "Textured terracotta abstract canvas.", sku: "AV-WA-002", barcode: "8901000000189", featuredImage: image("1549490349-8643362247b5"), gallery: [image("1549490349-8643362247b5")], isFeatured: true },
  { title: "Coastal Horizon Art Set", category: "Wall Art", brand: "BrightNest", price: 4299, salePrice: 3699, stock: 27, weight: 1.1, dimensions: "30 x 40 x 3 cm each", description: "A three-piece coastal art set with calm blue horizon artwork.", shortDescription: "Three-piece coastal wall art set.", sku: "BN-WA-003", barcode: "8901000000196", featuredImage: image("1549490349-8643362247b5"), gallery: [image("1549490349-8643362247b5")], isFeatured: false },
  { title: "Monochrome Mountain Poster", category: "Wall Art", brand: "ArtVista", price: 2699, salePrice: 0, stock: 55, weight: 0.45, dimensions: "42 x 59 x 2 cm", description: "A crisp monochrome mountain poster for modern homes and offices.", shortDescription: "Monochrome mountain art poster.", sku: "AV-WA-004", barcode: "8901000000202", featuredImage: image("1500530855697-b586d89ba3ee"), gallery: [image("1500530855697-b586d89ba3ee")], isFeatured: false },
];

async function main() {
  const categories = await prisma.category.findMany({ where: { status: "active" }, select: { id: true, name: true } });
  const brands = await prisma.brand.findMany({ where: { status: "active" }, select: { id: true, name: true } });
  const categoryByName = new Map(categories.map((item) => [item.name.toLowerCase(), item.id]));
  const brandByName = new Map(brands.map((item) => [item.name.toLowerCase(), item.id]));
  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!categoryByName.has(product.category.toLowerCase())) throw new Error(`Missing active category: ${product.category}`);
    if (!brandByName.has(product.brand.toLowerCase())) throw new Error(`Missing active brand: ${product.brand}`);
    if (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
      skipped += 1;
      continue;
    }
    await prisma.product.create({
      data: {
        title: product.title,
        slug,
        categoryId: categoryByName.get(product.category.toLowerCase())!,
        brandId: brandByName.get(product.brand.toLowerCase())!,
        price: product.price,
        salePrice: product.salePrice || null,
        stock: product.stock,
        weight: product.weight,
        dimensions: product.dimensions,
        description: product.description,
        shortDescription: product.shortDescription,
        sku: product.sku,
        barcode: product.barcode,
        featuredImage: product.featuredImage,
        gallery: product.gallery,
        status: "active",
        isFeatured: product.isFeatured,
      },
    });
    created += 1;
  }
  console.log(`Product seed complete. Created: ${created}; skipped existing: ${skipped}; total seed records: ${products.length}.`);
}

main().catch((error) => {
  console.error("Product seed failed:", error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
