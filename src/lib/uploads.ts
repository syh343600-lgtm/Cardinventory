import { mkdir, writeFile } from "fs/promises";
import path from "path";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 5 * 1024 * 1024;

function getExtension(file: File) {
  const extension = path.extname(file.name).toLowerCase();

  if (extension) return extension;

  switch (file.type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
}

export async function saveCardImage(formData: FormData) {
  const file = formData.get("image");

  if (!(file instanceof File) || file.size === 0) {
    return null;
  }

  if (!allowedTypes.has(file.type)) {
    throw new Error("请上传 JPG、PNG、WEBP 或 GIF 图片");
  }

  if (file.size > maxImageSize) {
    throw new Error("图片不能超过 5MB");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "cards");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${crypto.randomUUID()}${getExtension(file)}`;
  const bytes = await file.arrayBuffer();

  await writeFile(path.join(uploadsDir, filename), Buffer.from(bytes));

  return `/uploads/cards/${filename}`;
}
