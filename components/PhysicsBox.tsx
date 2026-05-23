"use client";

import { useEffect, useRef } from "react";
import type { Sticker } from "@/lib/types";

interface PhysicsBoxProps {
  stickers: Sticker[];
  selectedId: string | null;
  onStickerClick: (id: string) => void;
}

interface StickerBody {
  body: Matter.Body;
  img: HTMLImageElement;
  size: number;
  id: string;
}

export default function PhysicsBox({
  stickers,
  selectedId,
  onStickerClick,
}: PhysicsBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesMapRef = useRef<Map<string, StickerBody>>(new Map());
  const selectedIdRef = useRef<string | null>(selectedId);
  const animIdRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const addQueueRef = useRef<Sticker[]>([]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  // Initialize physics engine once
  useEffect(() => {
    if (initializedRef.current || !containerRef.current || !canvasRef.current)
      return;
    initializedRef.current = true;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    let mounted = true;

    (async () => {
      const Matter = await import("matter-js");
      const { Engine, Runner, Bodies, Composite } = Matter;

      const width = container.clientWidth;
      const height = container.clientHeight;
      canvas.width = width;
      canvas.height = height;

      const engine = Engine.create({ gravity: { y: 2 } });
      engineRef.current = engine;

      const runner = Runner.create();
      Runner.run(runner, engine);

      const wallOpts = { isStatic: true, friction: 1, restitution: 0.1 };
      Composite.add(engine.world, [
        Bodies.rectangle(width / 2, height + 25, width + 100, 50, wallOpts),
        Bodies.rectangle(-25, height / 2, 50, height * 2, wallOpts),
        Bodies.rectangle(width + 25, height / 2, 50, height * 2, wallOpts),
      ]);

      // Process initial stickers oldest-first so they settle bottom→top
      const sorted = [...stickers].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      for (const sticker of sorted) {
        if (!mounted) return;
        await addStickerBody(Matter, engine, sticker, width);
        await sleep(180);
      }

      const ctx = canvas.getContext("2d")!;
      const animate = () => {
        if (!mounted) return;
        ctx.clearRect(0, 0, width, height);

        bodiesMapRef.current.forEach(({ body, img, size, id }) => {
          const { x, y } = body.position;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(body.angle);

          if (selectedIdRef.current === id) {
            ctx.shadowColor = "rgba(99,102,241,0.55)";
            ctx.shadowBlur = 18;
          }

          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
        });

        animIdRef.current = requestAnimationFrame(animate);
      };
      animate();

      return () => {
        mounted = false;
        cancelAnimationFrame(animIdRef.current);
        Runner.stop(runner);
        Engine.clear(engine);
      };
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Add newly uploaded stickers without re-initializing
  const prevLengthRef = useRef(0);
  useEffect(() => {
    if (!engineRef.current) return;
    if (stickers.length <= prevLengthRef.current) {
      prevLengthRef.current = stickers.length;
      return;
    }

    const newOnes = stickers.filter((s) => !bodiesMapRef.current.has(s.id));
    prevLengthRef.current = stickers.length;

    if (newOnes.length === 0) return;

    let cancelled = false;
    (async () => {
      const Matter = await import("matter-js");
      const engine = engineRef.current!;
      const width = containerRef.current!.clientWidth;
      for (const sticker of newOnes) {
        if (cancelled) return;
        await addStickerBody(Matter, engine, sticker, width);
        await sleep(180);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stickers]);

  async function addStickerBody(
    Matter: typeof import("matter-js"),
    engine: Matter.Engine,
    sticker: Sticker,
    containerWidth: number
  ) {
    const { Bodies, Composite } = Matter;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = sticker.imageUrl;
    await new Promise<void>((r) => {
      img.onload = () => r();
      img.onerror = () => r();
    });

    const size = 68 + Math.random() * 24;
    const x = size / 2 + Math.random() * (containerWidth - size);
    const y = -size - Math.random() * 40;

    const body = Bodies.rectangle(x, y, size, size, {
      restitution: 0.25,
      friction: 0.75,
      frictionAir: 0.018,
      angle: (Math.random() - 0.5) * 0.7,
      label: sticker.id,
    });

    bodiesMapRef.current.set(sticker.id, { body, img, size, id: sticker.id });
    Composite.add(engine.world, body);
  }

  const handleClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !engineRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const Matter = await import("matter-js");
    const { Query } = Matter;

    const allBodies = Array.from(bodiesMapRef.current.values()).map(
      (b) => b.body
    );
    const found = Query.point(allBodies, { x, y });
    if (found.length > 0) {
      onStickerClick(found[0].label as string);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "repeating-linear-gradient(45deg, #fafaf9, #fafaf9 10px, #f5f5f4 10px, #f5f5f4 20px)" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      />
      {stickers.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <span className="text-4xl">🍽️</span>
          <p className="text-stone-400 text-sm">
            음식 사진을 업로드하면 스티커가 쌓여요
          </p>
        </div>
      )}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
