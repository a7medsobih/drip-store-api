import os from "os";
import path from "path";

const isVercel = Boolean(process.env.VERCEL);

const uploadsDirectory = isVercel
  ? path.resolve(os.tmpdir(), "drip-store-api-uploads")
  : path.resolve("uploads");

const productUploadsDirectory = path.join(uploadsDirectory, "products");

export { productUploadsDirectory, uploadsDirectory };