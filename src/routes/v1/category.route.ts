import { Router } from "express";
import CategoryController from "../../controllers/category.controller";
import { authenticateJWT, authorizeRoles } from "../../middlewares/auth.middleware";

const categoryRouter = Router();

categoryRouter.get("/", CategoryController.getCategories);
categoryRouter.post("/", authenticateJWT, authorizeRoles("admin", "super_admin"), CategoryController.createCategory);
categoryRouter.get("/:id", CategoryController.getCategory);
categoryRouter.put("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), CategoryController.updateCategory);
categoryRouter.delete("/:id", authenticateJWT, authorizeRoles("admin", "super_admin"), CategoryController.deleteCategory);

export default categoryRouter;
