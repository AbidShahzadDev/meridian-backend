import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { BadRequestError } from "../errors/badRequest.error";

dotenv.config();

interface Payload {
  id: string;
  role?: string;
}

export function generateJWT(payload: Payload, secret: string, expiresIn: string) {
  if (!secret || !expiresIn) {
    throw new BadRequestError("JWT configuration is missing");
  }

  return jwt.sign(payload, secret, { expiresIn });
}

export function generateJWTPair(payload: Payload) {
  const accessToken = generateJWT(payload, process.env.JWT_ACCESS_SECRET || "", process.env.JWT_ACCESS_EXPIRY || "1h");
  const refreshToken = generateJWT(payload, process.env.JWT_REFRESH_SECRET || "", process.env.JWT_REFRESH_EXPIRY || "7d");
  return { accessToken, refreshToken };
}

export function verifyRefreshJWT(token: string) {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new BadRequestError("JWT refresh secret is not configured");
  }

  const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET) as Payload;

  if (!payload || typeof payload === "string") {
    throw new BadRequestError("Invalid token");
  }

  return payload;
}
