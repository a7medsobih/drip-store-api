import fs from "fs";
import path from "path";

import multer from "multer";

import { productUploadsDirectory } from "../config/storage.js";
import logger from "../config/logger.js";
import AppError from "../utils/AppError.js";

let storage = multer.memoryStorage();

try {
  if (!fs.existsSync(productUploadsDirectory)) {
    fs.mkdirSync(productUploadsDirectory, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, productUploadsDirectory);
    },
    filename: (req, file, cb) => {
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;
      cb(null, uniqueFileName);
    }
  });
} catch (error) {
  logger.error(
    `Upload directory unavailable (${productUploadsDirectory}). Falling back to in-memory upload.`
  );
  logger.error(error.message);
}

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Only image files are allowed", 400));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter
});

export default upload;