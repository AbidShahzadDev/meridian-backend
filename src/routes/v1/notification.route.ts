import { Router } from "express";
import * as NotificationController from "../../controllers/notification.controller";
import { authenticateJWT } from "../../middlewares/auth.middleware";

const notificationRouter = Router();
notificationRouter.use(authenticateJWT);
notificationRouter.post("/devices", NotificationController.registerDevice);
notificationRouter.delete("/devices", NotificationController.unregisterDevice);
notificationRouter.get("/", NotificationController.list);
notificationRouter.patch("/:id/read", NotificationController.markRead);
notificationRouter.post("/read-all", NotificationController.markAllRead);

export default notificationRouter;
