import { Router } from "express";
import BrandController from "../../controllers/brand.controller";
import { authenticateJWT, authorizeRoles } from "../../middlewares/auth.middleware";

const brandRouter = Router();

brandRouter.get("/", BrandController.getBrands);
brandRouter.post("/", authenticateJWT, authorizeRoles("admin", "super_admin"), BrandController.createBrand);
brandRouter.get("/:id", BrandController.getBrand);
brandRouter.put("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), BrandController.updateBrand);
brandRouter.delete("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), BrandController.deleteBrand);

export default brandRouter;
