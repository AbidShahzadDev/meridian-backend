import { SESClient } from "@aws-sdk/client-ses";
import { config } from "dotenv";

config();

const accessKey = process.env.AWS_SES_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SES_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_SES_DEFAULT_REGION || process.env.AWS_REGION || "us-east-1";

export const SES = new SESClient({
  ...(accessKey && secretKey ? { credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } } : {}),
  region: region,
});

// might use this
