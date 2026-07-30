import mongoose from "mongoose";
import dns from "node:dns";

export async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing from the .env file");
  }

  const options = {
    dbName: process.env.MONGODB_DATABASE || "backend_test",
    serverSelectionTimeoutMS: 10000,
  };

  try {
    await mongoose.connect(mongoUri, options);
  } catch (error) {
    const isSrvDnsError =
      mongoUri.startsWith("mongodb+srv://") &&
      error instanceof Error &&
      error.message.includes("querySrv ECONNREFUSED");

    if (!isSrvDnsError) throw error;

    console.warn("Default DNS could not resolve MongoDB Atlas; retrying with public DNS servers");
    await mongoose.disconnect();
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(mongoUri, options);
  }

  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
