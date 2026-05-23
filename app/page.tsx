"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import StickerGallery from "@/components/StickerGallery";
import MemoPanel from "@/components/MemoPanel";
import UploadModal from "@/components/UploadModal";
import type { Sticker } from "@/lib/types";

const PhysicsBox = dynamic(() => import("@/components/PhysicsBox"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm">
      로딩 중...
    </div>
  ),
});

export default function Home() {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stickers")
      .then((r) => r.json())
      .then((data: Sticker[]) => {
        setStickers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectedSticker = stickers.find((s) => s.id === selectedId) ?? null;

  const handleStickerClick = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleUpload = useCallback((newSticker: Sticker) => {
    setStickers((prev) => [newSticker, ...prev]);
    setSelectedId(newSticker.id);
  }, []);

  const handleSaveMemo = useCallback(async (id: string, memo: string) => {
    const res = await fetch(`/api/stickers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memo }),
    });
    const updated: Sticker = await res.json();
    setStickers((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      await fetch(`/api/stickers/${id}`, { method: "DELETE" });
      setStickers((prev) => prev.filter((s) => s.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-stone-800 tracking-tight">
            Food Diary
          </h1>
          <p className="text-xs text-stone-400">오늘 먹은 음식을 스티커로 모아보세요</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 active:scale-95 transition-all"
        >
          <span className="text-lg leading-none">+</span>
          사진 추가
        </button>
      </header>

      {/* Main 3-column layout */}
      <main className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left: Sticker Gallery */}
        <aside className="w-52 shrink-0 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 shrink-0">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              스티커 목록
            </h2>
          </div>
          <div className="flex-1 overflow-hidden px-4 pb-4">
            <StickerGallery
              stickers={stickers}
              selectedId={selectedId}
              onStickerClick={handleStickerClick}
            />
          </div>
        </aside>

        {/* Center: Physics Box */}
        <section className="flex-1 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-stone-400">
              <div className="w-8 h-8 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
              <p className="text-sm">불러오는 중...</p>
            </div>
          ) : (
            <PhysicsBox
              stickers={stickers}
              selectedId={selectedId}
              onStickerClick={handleStickerClick}
            />
          )}
        </section>

        {/* Right: Memo Panel */}
        <aside className="w-56 shrink-0 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 pb-2 shrink-0">
            <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              메모
            </h2>
          </div>
          <div className="flex-1 overflow-hidden px-4 pb-4 flex flex-col">
            <MemoPanel
              sticker={selectedSticker}
              onSave={handleSaveMemo}
              onDelete={handleDelete}
            />
          </div>
        </aside>
      </main>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}
