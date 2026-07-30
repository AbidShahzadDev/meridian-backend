import { NextFunction, Request, Response } from "express";
import * as OrderService from "../services/order.service";
import { OrderListQuerySchema, PlaceCodOrderSchema, UpdateOrderStatusSchema } from "../validators/order.validation";

export async function place(req: Request, res: Response, next: NextFunction) {
  try {
    const order = await OrderService.placeCodOrder(req.user_id!, PlaceCodOrderSchema.parse(req.body));
    res.status(201).json({ success: true, message: "Cash on delivery order placed successfully", data: order });
  } catch (error) { next(error); }
}

export async function myOrders(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await OrderService.getMyOrders(req.user_id!, OrderListQuerySchema.parse(req.query)) }); }
  catch (error) { next(error); }
}

export async function myOrder(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await OrderService.getMyOrder(req.user_id!, req.params.id) }); }
  catch (error) { next(error); }
}

export async function cancelMine(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, message: "Order cancelled successfully", data: await OrderService.cancelMyOrder(req.user_id!, req.params.id) }); }
  catch (error) { next(error); }
}

export async function all(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await OrderService.getOrders(OrderListQuerySchema.parse(req.query)) }); }
  catch (error) { next(error); }
}

export async function one(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await OrderService.getOrder(req.params.id) }); }
  catch (error) { next(error); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = UpdateOrderStatusSchema.parse(req.body);
    res.json({ success: true, message: "Order status updated successfully", data: await OrderService.updateOrderStatus(req.params.id, status) });
  } catch (error) { next(error); }
}
