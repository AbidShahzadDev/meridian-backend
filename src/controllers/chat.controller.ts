import { NextFunction, Request, Response } from "express";
import * as ChatService from "../services/chat.service";
import { ChatListQuerySchema, ChatMessageSchema } from "../validators/chat.validation";

export async function products(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ChatService.getProducts(ChatListQuerySchema.parse(req.query));
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

export async function categories(_req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await ChatService.getCategories() }); }
  catch (error) { next(error); }
}

export async function featuredProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ChatService.getFeaturedProducts(ChatListQuerySchema.parse(req.query));
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

export async function relatedProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { limit } = ChatListQuerySchema.pick({ limit: true }).parse(req.query);
    const data = await ChatService.getRelatedProducts(req.params.productId, limit);
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

export async function cart(req: Request, res: Response, next: NextFunction) {
  try { res.json({ success: true, data: await ChatService.getCart(req.user_id!) }); }
  catch (error) { next(error); }
}

export async function message(req: Request, res: Response, next: NextFunction) {
  try {
    const input = ChatMessageSchema.parse(req.body);
    res.json({ success: true, data: await ChatService.answerMessage(input, req.user_id) });
  } catch (error) { next(error); }
}

export async function streamMessage(req: Request, res: Response, next: NextFunction) {
  let streamStarted = false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);
  res.on("close", () => controller.abort());

  try {
    const input = ChatMessageSchema.parse(req.body);
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    streamStarted = true;

    await ChatService.streamMessage(input, req.user_id, (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }, controller.signal);
    res.end();
  } catch (error) {
    if (!streamStarted) return next(error);
    if (!res.writableEnded) {
      const message = error instanceof Error && error.name === "AbortError"
        ? "The assistant request timed out."
        : "The assistant is temporarily unavailable.";
      res.write(`data: ${JSON.stringify({ type: "error", message })}\n\n`);
      res.end();
    }
  } finally {
    clearTimeout(timeout);
  }
}
