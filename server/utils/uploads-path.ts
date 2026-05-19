import fs from "fs";
import path from "path";

const candidateRoots = [
  path.resolve(process.cwd(), "uploads"),
  path.resolve(process.cwd(), "server", "uploads"),
  path.resolve(__dirname, "..", "uploads"),
  path.resolve(__dirname, "..", "..", "uploads")
];

export const uploadsRoot =
  candidateRoots.find((candidate) => fs.existsSync(candidate)) ?? candidateRoots[1];