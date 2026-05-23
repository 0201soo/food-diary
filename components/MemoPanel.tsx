"use client";

import { useState, useEffect } from "react";
import type { Sticker } from "@/lib/types";

interface MemoPanelProps {
  sticker: Sticker | null;
  onSave: (id: string, memo: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function MemoPanel({ sticker, onSave, onDelete }: MemoPanelProps) {
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setMemo(sticker?.memo ?? "");
    setSaveState("idle");
  }, [sticker]);

  if (!sticker) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-300 px-2">
        <span className="text-4xl">✏️</span>
        <p className="text-xs text-center leading-relaxed">
          갤러리나 물리 박스에서<br />스티커를 선택해보세요
        </p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    await onSave(sticker.id, memo);
    setSaving(false);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  };

  const handleDelete = async () => {
    if (!confirm("이 스티커를 삭제할까요?")) return;
    setDeleting(true);
    await onDelete(sticker.id);
    setDeleting(false);
  };

  const formattedDate = new Date(sticker.date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Sticker preview */}
      <div className="flex justify-center">
        <div
          className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center border border-stone-100"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #f5f5f4 25%, transparent 25%), linear-gradient(-45deg, #f5f5f4 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f5f5f4 75%), linear-gradient(-45deg, transparent 75%, #f5f5f4 75%)",
            backgroundSize: "12px 12px",
            backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
            backgroundColor: "#fafaf9",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sticker.imageUrl}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Date */}
      <div className="px-1">
        <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">
          날짜
        </p>
        <p className="text-sm text-stone-700 font-medium">{formattedDate}</p>
      </div>

      {/* Memo textarea */}
      <div className="flex-1 flex flex-col px-1">
        <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">
          메모
        </p>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="이 음식의 기억을 남겨보세요..."
          className="flex-1 resize-none rounded-xl border border-stone-200 p-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-stone-50 min-h-[100px]"
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`mx-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
          saveState === "saved"
            ? "bg-emerald-500 text-white"
            : "bg-stone-800 text-white hover:bg-stone-700 active:scale-95"
        } disabled:opacity-60`}
      >
        {saving ? "저장 중..." : saveState === "saved" ? "저장됨 ✓" : "저장"}
      </button>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="mx-1 py-2 rounded-xl text-xs text-stone-400 hover:text-red-400 hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        {deleting ? "삭제 중..." : "스티커 삭제"}
      </button>
    </div>
  );
}
