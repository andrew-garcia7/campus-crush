import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { uploadsRoot } from "../utils/uploads-path";

async function ensureDir(dirName: string) {
  const full = path.join(uploadsRoot, dirName);
  await fs.mkdir(full, { recursive: true });
  return full;
}

function publicPath(folder: string, name: string) {
  return `/uploads/${folder}/${name}`;
}

async function saveUpload(folder: string, buffer: Buffer, ext = "jpg") {
  const dir = await ensureDir(folder);
  const name = `${crypto.randomUUID()}.${ext}`;
  const full = path.join(dir, name);
  await fs.writeFile(full, buffer);
  return { filePath: full, publicUrl: publicPath(folder, name) };
}

export const saveStudentId = async (buffer: Buffer, ext = "jpg") => {
  return saveUpload("student-ids", buffer, ext);
};

export const saveSelfieVerification = async (buffer: Buffer, ext = "jpg") => {
  return saveUpload("selfie-verification", buffer, ext);
};

export const saveProfileImage = async (buffer: Buffer, ext = "jpg") => {
  return saveUpload("profile-images", buffer, ext);
};

export const saveGalleryImage = async (buffer: Buffer, ext = "jpg") => {
  return saveUpload("gallery-images", buffer, ext);
};

export const saveVoiceMessage = async (buffer: Buffer, ext = "webm") => {
  return saveUpload("voice-messages", buffer, ext);
};
