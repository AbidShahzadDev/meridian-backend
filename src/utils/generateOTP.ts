import { randomInt } from "crypto";

export function generateOTP(length: number): string {
    if (!Number.isInteger(length) || length < 1 || length > 12) throw new Error("Invalid OTP length");
    return Array.from({ length }, () => randomInt(0, 10)).join("");
  }
  
