import { InferSchemaType, model, models, Schema } from "mongoose";

const mongoUserSchema = new Schema(
  {
    // telegramId: { type: String, required: true, unique: true, trim: true },
    username: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNo: { type: String, sparse: true, trim: true },
    profilePicture: { type: String, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["buyer", "admin", "super_admin"],
      default: "buyer",
      required: true,
    },
    isActive: { type: Boolean, default: true, required: true },
  },
  {
    collection: "users",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

mongoUserSchema.set("toJSON", {
  transform: (_document, returnedObject) => {
    delete (returnedObject as Record<string, unknown>).password;
    return returnedObject;
  },
});

export type MongoUser = InferSchemaType<typeof mongoUserSchema>;

export const MongoUserModel = models.User || model("User", mongoUserSchema);
