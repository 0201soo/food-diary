import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function GET() {
  const stickers = await prisma.sticker.findMany({
    orderBy: { date: "desc" },
  });
  return Response.json(stickers);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const memo = (formData.get("memo") as string) ?? "";

  if (!file) {
    return Response.json({ error: "No image provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${randomUUID()}.png`;
  let imageUrl: string;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`stickers/${filename}`, buffer, {
      access: "public",
      contentType: "image/png",
    });
    imageUrl = blob.url;
  } else {
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    await writeFile(join(uploadsDir, filename), buffer);
    imageUrl = `/uploads/${filename}`;
  }

  const sticker = await prisma.sticker.create({
    data: { imageUrl, memo },
  });

  return Response.json(sticker, { status: 201 });
}
