
import multer from "multer";
import path from "path";
import fs from "fs";

export const upload = (folderName: string) => {
  const basePath = fs.existsSync(path.join(process.cwd(), "uploads"))
    ? path.join(process.cwd(), "uploads")
    : path.join(process.cwd(), "server", "uploads");

  const uploadDir = path.join(basePath, folderName);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname);
      const rawBaseName = path.basename(file.originalname, extension);

      const sanitizedBase =
        rawBaseName.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "photo";

      cb(null, `${sanitizedBase}-${Date.now()}${extension}`);
    },
  });

  const fileFilter: multer.Options["fileFilter"] = (
    _req,
    file,
    cb
  ) => {
    const allowedImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/x-icon",
    ];

    const allowedVideoTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
    ];

    const isImage = allowedImageTypes.includes(file.mimetype);
    const isVideo =
      allowedVideoTypes.includes(file.mimetype) ||
      file.mimetype.startsWith("video/");

    if (folderName === "testimonial") {
      if (isImage || isVideo) {
        return cb(null, true);
      }

      return cb(
        new Error(
          "Only JPG, JPEG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed"
        )
      );
    }

    if (isImage) {
      return cb(null, true);
    }

    return cb(
      new Error("Only JPG, JPEG, PNG, WEBP, SVG and ICO images are allowed")
    );
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        folderName === "testimonial"
          ? 50 * 1024 * 1024
          : 10 * 1024 * 1024,
    },
  });
};
