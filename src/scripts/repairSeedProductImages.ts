import "dotenv/config";
import prisma from "../prisma/client";

const validImage = "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80";
const validClock = "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=900&q=80";
const mirrorImages: Record<string, string> = {
  "RF-MIR-001": "https://placehold.co/900x900/e8e0d5/333333?text=Round+Walnut+Mirror",
  "AV-MIR-002": "https://placehold.co/900x900/e8e0d5/333333?text=Arched+Entryway+Mirror",
  "RF-MIR-003": "https://placehold.co/900x900/e8e0d5/333333?text=Geometric+Mirror",
  "AV-MIR-004": "https://placehold.co/900x900/e8e0d5/333333?text=Rattan+Mirror",
};

async function main() {
  const seeded = await prisma.product.findMany({ where: { barcode: { startsWith: "890100" } }, select: { id: true, sku: true, category: { select: { name: true } } } });
  let updated = 0;
  for (const product of seeded) {
    const url = product.sku && mirrorImages[product.sku]
      ? mirrorImages[product.sku]
      : product.category?.name === "Candles" ? validImage
        : product.category?.name === "Clock" ? validClock
          : undefined;
    if (!url) continue;
    await prisma.product.update({ where: { id: product.id }, data: { featuredImage: url, gallery: [url] } });
    updated += 1;
  }
  console.log(`Repaired image URLs for ${updated} seeded products.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
