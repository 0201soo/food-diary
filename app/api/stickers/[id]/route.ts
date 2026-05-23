import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { memo } = await request.json();

  const sticker = await prisma.sticker.update({
    where: { id },
    data: { memo },
  });

  return Response.json(sticker);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await prisma.sticker.delete({ where: { id } });

  return Response.json({ success: true });
}
