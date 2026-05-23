"use client";

import { useState } from "react";
import type { Sticker, SortOrder } from "@/lib/types";

interface StickerGalleryProps {
  stickers: Sticker[];
  selectedId: string | null;
  onStickerClick: (id: string) => void;
}

export default function StickerGallery({
  stickers,
  selectedId,
  onStickerClick,
}: StickerGalleryProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const sorted = [...stickers].sort((a, b) => {
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    return sortOrder === "newest" ? tB - tA : tA - tB;
  });

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Sort toggle */}
      <div className="flex gap-1.5">
        {(["newest", "oldest"] as SortOrder[]).map((order) => (
          <button
            key={order}
            onClick={() => setSortOrder(order)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              sortOrder === order
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200"
            }`}
          >
            {order === "newest" ? "최신순" : "오래된순"}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto -mr-1 pr-1">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2 text-stone-300">
            <span className="text-3xl">🍴</span>
            <p className="text-xs text-center">아직 스티커가 없어요</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {sorted.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onStickerClick(sticker.id)}
                title={
                  sticker.memo ||
                  new Date(sticker.date).toLocaleDateString("ko-KR")
                }
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                  selectedId === sticker.id
                    ? "border-indigo-400 scale-105 shadow-md shadow-indigo-100"
                    : "border-transparent hover:border-stone-300 hover:scale-102"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.imageUrl}
                  alt=""
                  className="w-full h-full object-contain bg-stone-50"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-stone-300 text-center">
        {sorted.length}개의 스티커
      </p>
    </div>
  );
}
