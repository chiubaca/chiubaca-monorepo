#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import exifr from "exifr";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const photosDir = path.join(root, "apps/chiubaca.com/public/photos");
const outputFile = path.join(root, "apps/chiubaca.com/src/data/photos.ts");

const photoSchema = z.object({
  filename: z.string(),
  date: z.string().datetime().nullable(),
  caption: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
});

const supportedExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function writeEmptyModule() {
  fs.writeFileSync(
    outputFile,
    "export const photos = [] as { filename: string; date: string | null; caption: string; width: number | null; height: number | null }[];\n",
  );
}

function extractDate(exif) {
  if (!exif?.DateTimeOriginal) return null;
  return new Date(exif.DateTimeOriginal).toISOString();
}

function extractDimensions(exif) {
  let width = exif?.ImageWidth || null;
  let height = exif?.ImageHeight || null;
  if (exif?.Orientation && [5, 6, 7, 8].includes(exif.Orientation)) {
    [width, height] = [height, width];
  }
  return { width, height };
}

async function parsePhoto(file) {
  const filePath = path.join(photosDir, file);
  try {
    const exif = await exifr.parse(filePath, {
      pick: ["DateTimeOriginal", "ImageDescription", "ImageWidth", "ImageHeight", "Orientation"],
    });
    const { width, height } = extractDimensions(exif);
    return {
      filename: file,
      date: extractDate(exif),
      caption: exif?.ImageDescription?.trim() || "no caption",
      width,
      height,
    };
  } catch {
    return {
      filename: file,
      date: null,
      caption: "no caption",
      width: null,
      height: null,
    };
  }
}

async function main() {
  if (!fs.existsSync(photosDir)) {
    writeEmptyModule();
    console.log("⚠️  No photos directory found, wrote empty module");
    return;
  }

  const files = fs
    .readdirSync(photosDir)
    .filter((f) => supportedExts.has(path.extname(f).toLowerCase()));

  if (files.length === 0) {
    writeEmptyModule();
    console.log("⚠️  No photos found, wrote empty module");
    return;
  }

  const entries = [];
  for (const file of files) {
    const raw = await parsePhoto(file);
    entries.push(photoSchema.parse(raw));
  }

  entries.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const ts = `export const photos = ${JSON.stringify(entries, null, 2)} as const;\n`;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, ts);
  console.log(`✅ Photo module written (${entries.length} photos)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
