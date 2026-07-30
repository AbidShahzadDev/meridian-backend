import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import * as ChatController from "../controllers/chat.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { optionalAuthenticateJWT } from "../middlewares/optional-auth.middleware";

const chatRouter = Router();
const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many chat requests. Please try again shortly.", errors: [] },
});

chatRouter.use(chatLimiter);
chatRouter.get("/products", ChatController.products);
chatRouter.get("/categories", ChatController.categories);
chatRouter.get("/featured-products", ChatController.featuredProducts);
chatRouter.get("/related-products/:productId", ChatController.relatedProducts);
chatRouter.get("/cart", authenticateJWT, ChatController.cart);
chatRouter.post("/message/stream", optionalAuthenticateJWT, ChatController.streamMessage);
chatRouter.post("/message", optionalAuthenticateJWT, ChatController.message);

export default chatRouter;
