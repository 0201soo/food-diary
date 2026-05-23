"use client";

import { useState, useRef, useCallback } from "react";
import type { Sticker } from "@/lib/types";

interface UploadModalProps {
  onClose: () => void;
  onUpload: (sticker: Sticker) => void;
}

type Status = "idle" | "processing" | "ready" | "uploading";

export default function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [originalUrl, setOriginalUrl] = useState("");
  const [processedUrl, setProcessedUrl] = useState("");
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    setStatus("processing");
    setError("");
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const result = await removeBackground(file, {
        model: "isnet_quint8",
        output: { format: "image/png", quality: 0.9 },
      });
      const url = URL.createObjectURL(result);
      setProcessedBlob(result);
      setProcessedUrl(url);
      setStatus("ready");
    } catch {
      setError("배경 제거에 실패했어요. 다시 시도해주세요.");
      setStatus("idle");
    }
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setOriginalUrl(URL.createObjectURL(file));
      processImage(file);
    },
    [processImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (!processedBlob) return;
    setStatus("uploading");
    setError("");
    try {
      const form = new FormData();
      form.append("image", processedBlob, "sticker.png");
      const res = await fetch("/api/stickers", { method: "POST", body: form });
      if (!res.ok) throw new Error("upload failed");
      const sticker: Sticker = await res.json();
      onUpload(sticker);
      onClose();
    } catch {
      setError("업로드에 실패했어요. 다시 시도해주세요.");
      setStatus("ready");
    }
  };

  const reset = () => {
    setStatus("idle");
    setOriginalUrl("");
    setProcessedUrl("");
    setProcessedBlob(null);
    setError("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-800">
            음식 사진 추가
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Idle: drop zone */}
        {status === "idle" && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 py-14 cursor-pointer hover:border-stone-300 hover:bg-stone-50 transition-all"
          >
            <span className="text-5xl">📷</span>
            <div className="text-center">
              <p className="text-sm font-medium text-stone-600">
                사진을 드래그하거나 클릭
              </p>
              <p className="text-xs text-stone-400 mt-0.5">
                JPG · PNG · HEIC · WEBP
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        )}

        {/* Processing */}
        {status === "processing" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <div className="relative w-28 h-28">
              {originalUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={originalUrl}
                  alt=""
                  className="w-full h-full object-contain rounded-xl opacity-40"
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-stone-600 font-medium">배경 제거 중...</p>
              <p className="text-xs text-stone-400 mt-1">
                처음 실행 시 모델 다운로드로 시간이 걸릴 수 있어요
              </p>
            </div>
          </div>
        )}

        {/* Ready / Uploading */}
        {(status === "ready" || status === "uploading") && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-stone-400 text-center mb-1">원본</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalUrl}
                  alt=""
                  className="w-full aspect-square object-contain rounded-xl bg-stone-100 border border-stone-100"
                />
              </div>
              <div>
                <p className="text-[10px] text-stone-400 text-center mb-1">누끼</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={processedUrl}
                  alt=""
                  className="w-full aspect-square object-contain rounded-xl border border-stone-100"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)",
                    backgroundSize: "10px 10px",
                    backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={status === "uploading"}
              className="w-full py-3 bg-stone-800 text-white rounded-2xl text-sm font-medium hover:bg-stone-700 active:scale-95 transition-all disabled:opacity-60"
            >
              {status === "uploading" ? "저장 중..." : "스티커로 저장"}
            </button>

            <button
              onClick={reset}
              className="w-full py-1.5 text-stone-400 text-xs hover:text-stone-600 transition-colors"
            >
              다시 선택
            </button>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-500 text-center -mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
