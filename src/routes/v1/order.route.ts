import { Router } from "express";
import * as OrderController from "../../controllers/order.controller";
import { authenticateJWT, authorizeRoles } from "../../middlewares/auth.middleware";

const orderRouter = Router();

orderRouter.use(authenticateJWT);
orderRouter.post("/", OrderController.place);
orderRouter.get("/me", OrderController.myOrders);
orderRouter.get("/me/:id", OrderController.myOrder);
orderRouter.post("/me/:id/cancel", OrderController.cancelMine);
orderRouter.get("/", authorizeRoles("admin", "super_admin"), OrderController.all);
orderRouter.get("/:id", authorizeRoles("admin", "super_admin"), OrderController.one);
orderRouter.patch("/:id/status", authorizeRoles("admin", "super_admin"), OrderController.updateStatus);

export default orderRouter;
