import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface UserPayload extends JwtPayload {
  id: string;
  role?: string;
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: "Authorization token missing", errors: [] });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ success: false, message: "Use a Bearer authorization token", errors: [] });
  }

  if (!process.env.JWT_ACCESS_SECRET) {
    return res.status(500).json({ success: false, message: "JWT configuration is missing", errors: [] });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET || "", (err, user) => {
    if (err || !user || typeof user === "string") {
      return res.status(401).json({ success: false, message: "Invalid or expired token", errors: [] });
    }

    const payload = user as UserPayload;
    req.user_id = payload.id;
    req.user_role = payload.role;
    next();
  });
};

export const authorizeRoles = (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user_role || !allowedRoles.includes(req.user_role)) {
      return res.status(403).json({ success: false, message: "You do not have permission for this action", errors: [] });
    }
    next();
  };
