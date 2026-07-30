import { SendEmailCommand } from "@aws-sdk/client-ses";
import dotenv from "dotenv";
import { SES } from "../factories/ses.factory";

dotenv.config();

export async function sendLoginCode(email: string, loginCode: string, purpose: string) {
  const senderEmail = process.env.SENDER_EMAIL;
  if (!senderEmail) throw new Error("SENDER_EMAIL is not configured");
  const senderName = process.env.SENDER_NAME || "Einfalt";
  const sender = `${senderName} <${senderEmail}>`;
  const safePurpose = purpose.replace(/[<>]/g, "");

  await SES.send(new SendEmailCommand({
    Source: sender,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: `${senderName} email verification code`, Charset: "UTF-8" },
      Body: {
        Text: {
          Data: `Your ${safePurpose} verification code is ${loginCode}. It expires in 10 minutes. If you did not request this, ignore this email.`,
          Charset: "UTF-8",
        },
        Html: {
          Data: `<p>Your ${safePurpose} verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${loginCode}</p><p>This code expires in 10 minutes.</p>`,
          Charset: "UTF-8",
        },
      },
    },
  }));
}
