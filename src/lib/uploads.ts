import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

type SaveCardImageInput = FormData | File | null | undefined;

function getFileFromInput(input: SaveCardImageInput) {
  if (!input) {
    return null;
  }

  if (input instanceof File) {
    return input;
  }

  const possibleKeys = ["image", "imageFile", "cardImage", "file"];

  for (const key of possibleKeys) {
    const value = input.get(key);

    if (value instanceof File && value.size > 0) {
      return value;
    }
  }

  return null;
}

export async function saveCardImage(input: SaveCardImageInput) {
  const file = getFileFromInput(input);

  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("只能上传图片文件");
  }

  const originalName = file.name || "card-image";
  const extension = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "") || "jpg";

  const pathname = `card-images/${randomUUID()}.${safeExtension}`;

  const blob = await put(pathname, file, {
    access: "public",
    contentType: file.type || "image/jpeg",
  });

  return blob.url;
}