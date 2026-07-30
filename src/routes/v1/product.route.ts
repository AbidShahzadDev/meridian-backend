import { Router } from "express";
import ProductController from "../../controllers/product.controller";
import { authenticateJWT, authorizeRoles } from "../../middlewares/auth.middleware";
import { uploadProductImages } from "../../middlewares/upload.middleware";

const productRouter = Router();

productRouter.get("/", ProductController.getProducts);
productRouter.post("/", authenticateJWT, authorizeRoles("admin", "super_admin"), ProductController.createProduct);
productRouter.put("/:id/images", authenticateJWT, authorizeRoles("admin", "super_admin"), uploadProductImages, ProductController.updateProductImages);
productRouter.get("/:id", ProductController.getProduct);
productRouter.put("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), ProductController.updateProduct);
productRouter.delete("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), ProductController.deleteProduct);

export default productRouter;
