import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const accessKey = process.env.AWS_ACCESS_KEY_ID!;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY!;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

if (!accessKey || !secretKey || !region) {
  throw new Error("AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION are required");
}

export const S3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  region: region,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: Boolean(process.env.S3_ENDPOINT),
});

// most likely won't use this
