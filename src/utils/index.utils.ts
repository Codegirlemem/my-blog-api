import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";
import AppError from "./appError.utils.js";

export const allowedFiles = ["image/jpeg", "image/png", "image/webp"];
export const restrictionDays = Number(process.env.RESTRICTION_DAYS) || 3;

export const uploadToCloudinary = async (filePath: string) => {
  try {
    const avatar = await cloudinary.uploader.upload(filePath, {
      folder: "axia-blog/avatars",
    });
    await fs.unlink(filePath);
    return { secure_url: avatar.secure_url, public_id: avatar.public_id };
  } catch (error) {
    await fs.unlink(filePath);
    throw new AppError("Failed to upload avatar image", 400);
  }
};

export const deleteCloudImage = async (public_id: string) => {
  if (public_id) {
    try {
      await cloudinary.uploader.destroy(public_id);
    } catch (destroyError) {
      console.error("Failed to delete old avatar:", destroyError);
    }
  }
};

export const CapitalizeFirstLetter = (word: string) => {
  const newWord = word.charAt(0).toUpperCase + word.slice(1);
  return newWord;
};
