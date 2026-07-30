import multer from "multer";
import { BadRequestError } from "../errors";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 9 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype)) {
      return callback(new BadRequestError("Only JPEG, PNG, WebP, and GIF images are allowed"));
    }
    callback(null, true);
  },
});

export const uploadProfileImage = imageUpload.single("profileImage");
export const uploadProductImages = imageUpload.fields([
  { name: "featuredImage", maxCount: 1 },
  { name: "gallery", maxCount: 8 },
]);
