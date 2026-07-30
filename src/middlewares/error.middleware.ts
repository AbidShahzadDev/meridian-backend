import { NextFunction, Request, Response } from "express";
import { BaseError } from "../errors/base.error";
import { BadRequestError } from "../errors/badRequest.error";
import { ForbiddenError } from "../errors/forbidden.error";
import { NotFoundError } from "../errors/notFound.error";
import { UnauthorizedError } from "../errors/unauthorized.error";
import multer from "multer";
import { ZodError } from "zod";

export default function errHandlingMiddleware(error: BaseError, req: Request, res: Response, next: NextFunction) {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: error.message, errors: [] });
  }
  if (error instanceof BadRequestError) {
    return res.status(400).json({ success: false, message: error.message, errors: [] });
  }

  if (error instanceof ZodError) {
    const errors = error.errors.map((issue) => ({
      ...issue,
      field: issue.path.length ? issue.path.join(".") : "request",
    }));
    const message = errors.map((issue) => `${issue.field}: ${issue.message}`).join("; ");
    return res.status(400).json({ success: false, message, errors });
  }

  if (error instanceof ForbiddenError) {
    return res.status(403).json({ success: false, message: error.message, errors: [] });
  }

  if (error instanceof UnauthorizedError) {
    return res.status(401).json({ success: false, message: error.message, errors: [] });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ success: false, message: error.message, errors: [] });
  }

  res.status(500).json({ success: false, message: error.message || "Internal server error", errors: [] });
}
