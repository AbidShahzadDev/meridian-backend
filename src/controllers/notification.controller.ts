import { NextFunction, Request, Response } from "express";
import NotificationService from "../services/notification.service";
import { NotificationDeviceSchema, NotificationListQuerySchema } from "../validators/notification.validation";

export async function registerDevice(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json({ success: true, data: await NotificationService.registerDevice(req.user_id!, NotificationDeviceSchema.parse(req.body)) });
  } catch (error) { next(error); }
}

export async function unregisterDevice(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = NotificationDeviceSchema.parse(req.body);
    await NotificationService.unregisterDevice(req.user_id!, token);
    res.json({ success: true, message: "Notification device removed" });
  } catch (error) { next(error); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await NotificationService.listNotifications(req.user_id!, NotificationListQuerySchema.parse(req.query)) }); }
  catch (error) { next(error); }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await NotificationService.markRead(req.user_id!, req.params.id) }); }
  catch (error) { next(error); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await NotificationService.markAllRead(req.user_id!) }); }
  catch (error) { next(error); }
}
