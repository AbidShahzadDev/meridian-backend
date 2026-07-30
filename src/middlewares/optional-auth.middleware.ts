import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface UserPayload extends JwtPayload {
  id: string;
  role?: string;
}

/** Allows anonymous product questions, but validates any token that is supplied. */
export function optionalAuthenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Use a Bearer authorization token", errors: [] });
  }
  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(500).json({ success: false, message: "JWT configuration is missing", errors: [] });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET) as UserPayload;
    if (!payload.id) throw new Error("Missing subject");
    req.user_id = payload.id;
    req.user_role = payload.role;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token", errors: [] });
  }
}
