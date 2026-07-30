import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { S3 } from "../factories/s3.factory";
import { BadRequestError } from "../errors";

const bucket = process.env.S3_BUCKET_NAME;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function hasValidSignature(file: Express.Multer.File) {
  const bytes = file.buffer;
  if (file.mimetype === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (file.mimetype === "image/gif") return ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString("ascii"));
  if (file.mimetype === "image/webp") return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

function publicUrl(key: string) {
  const configuredBase = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (configuredBase) return `${configuredBase}/${key}`;
  if (process.env.S3_ENDPOINT) {
    const publicBase = process.env.S3_ENDPOINT.replace(/\/s3\/?$/, "/object/public").replace(/\/$/, "");
    return `${publicBase}/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function uploadImage(file: Express.Multer.File, folder: "products" | "profiles") {
  if (!bucket || !region) throw new Error("S3_BUCKET_NAME and AWS_REGION are required");
  if (!hasValidSignature(file)) throw new BadRequestError("The uploaded file content is not a valid image");

  const key = `${folder}/${randomUUID()}.${extensions[file.mimetype]}`;
  await S3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return { key, url: publicUrl(key) };
}

async function deleteImage(key: string) {
  if (!bucket) return;
  await S3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

async function deleteImageByUrl(url: string | null | undefined) {
  if (!url || !bucket) return;
  try {
    const parsed = new URL(url);
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (key.startsWith("products/") || key.startsWith("profiles/")) await deleteImage(key);
  } catch {
    // Ignore external or malformed legacy URLs.
  }
}

export default { uploadImage, deleteImage, deleteImageByUrl };
