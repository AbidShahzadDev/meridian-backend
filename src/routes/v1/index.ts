import { Router } from "express";
import authRouter from "./auth.route";
import userRouter from "./user.route";
import categoryRouter from "./category.route";
import brandRouter from "./brand.route";
import productRouter from "./product.route";
import chatRouter from "../chat.route";
import orderRouter from "./order.route";
import notificationRouter from "./notification.route";

const v1Router = Router();

v1Router.get("/", (req, res) => {
  res.send("Hit v1 route");
});

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/categories", categoryRouter);
v1Router.use("/brands", brandRouter);
v1Router.use("/products", productRouter);
v1Router.use("/chat", chatRouter);
v1Router.use("/orders", orderRouter);
v1Router.use("/notifications", notificationRouter);

export default v1Router;
