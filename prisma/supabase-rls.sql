-- Run this in Supabase SQL Editor after the Prisma cart migration.
-- The Express API uses its own JWT and enforces ownership in every query. These
-- policies additionally protect the tables from direct Supabase Data API access.

ALTER TABLE public."Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Category" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Brand" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Cart" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CartItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OrderItem" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public."Product", public."Category", public."Brand", public."User", public."Cart", public."CartItem" FROM anon, authenticated;
REVOKE ALL ON public."Order", public."OrderItem" FROM anon, authenticated;

GRANT SELECT ("title", "slug", "description", "shortDescription", "price", "salePrice", "stock", "weight", "dimensions", "featuredImage", "gallery", "categoryId", "brandId", "isFeatured")
  ON public."Product" TO anon, authenticated;
GRANT SELECT ("name", "slug") ON public."Category" TO anon, authenticated;
GRANT SELECT ("name", "slug") ON public."Brand" TO anon, authenticated;
GRANT SELECT ("id", "username", "firstName", "lastName", "email", "phoneNo", "profilePicture", "isActive", "createdAt", "updatedAt")
  ON public."User" TO authenticated;
GRANT SELECT ON public."Cart", public."CartItem" TO authenticated;

CREATE POLICY "public reads active products" ON public."Product"
  FOR SELECT TO anon, authenticated USING ("status" = 'active');
CREATE POLICY "public reads active categories" ON public."Category"
  FOR SELECT TO anon, authenticated USING ("status" = 'active');
CREATE POLICY "public reads active brands" ON public."Brand"
  FOR SELECT TO anon, authenticated USING ("status" = 'active');
CREATE POLICY "user reads own profile" ON public."User"
  FOR SELECT TO authenticated USING ("id" = (select auth.uid())::text);
CREATE POLICY "user reads own cart" ON public."Cart"
  FOR SELECT TO authenticated USING ("userId" = (select auth.uid())::text);
CREATE POLICY "user reads own cart items" ON public."CartItem"
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public."Cart" c
      WHERE c."id" = "CartItem"."cartId" AND c."userId" = (select auth.uid())::text
    )
  );

-- Orders remain server-only. The Express API validates its JWT, ownership, and
-- admin roles; no direct Data API grants are provided for orders or payments.
