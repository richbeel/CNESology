'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BackLink } from '@/components/ui/BackLink';
import { cn } from '@/lib/utils/cn';

type DrawingFullscreenViewerProps = {
  url: string;
  isPdf: boolean;
  projectName: string;
  backHref: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;

const toolBtn =
  'inline-flex h-9 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800 px-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700';

export function DrawingFullscreenViewer({
  url,
  isPdf,
  projectName,
  backHref,
}: DrawingFullscreenViewerProps) {
  if (isPdf) {
    return (
      <div className="flex min-h-dvh flex-col bg-zinc-900">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-700 px-4 py-3">
          <BackLink href={backHref} label="Zpět na projekt" />
          <div className="min-w-0 flex-1 px-2 text-center">
            <p className="truncate text-sm font-medium text-white">{projectName}</p>
            <p className="text-xs text-zinc-400">Zoomujte v prohlížeči PDF · otočte telefon</p>
          </div>
          <div className="size-8 shrink-0" aria-hidden />
        </header>
        <iframe
          src={url}
          title={`Výkres — ${projectName}`}
          className="min-h-0 flex-1 w-full border-0 bg-zinc-800"
        />
      </div>
    );
  }

  return <ImagePinchViewer url={url} projectName={projectName} backHref={backHref} />;
}

function ImagePinchViewer({
  url,
  projectName,
  backHref,
}: {
  url: string;
  projectName: string;
  backHref: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchStart = useRef<{ distance: number; scale: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  const clampScale = (value: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = clampScale(s + delta);
      if (next <= 1) setOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setScale((s) => {
        const next = clampScale(s + delta);
        if (next <= 1) setOffset({ x: 0, y: 0 });
        return next;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  function pointerDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = { distance: pointerDistance(a, b), scale };
      panStart.current = null;
    } else if (pointers.current.size === 1 && scale > 1) {
      panStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const distance = pointerDistance(a, b);
      const ratio = distance / pinchStart.current.distance;
      setScale(clampScale(pinchStart.current.scale * ratio));
      return;
    }

    if (pointers.current.size === 1 && panStart.current && scale > 1) {
      setOffset({
        x: panStart.current.ox + (e.clientX - panStart.current.x),
        y: panStart.current.oy + (e.clientY - panStart.current.y),
      });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) panStart.current = null;
  }

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-900">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-zinc-700 px-4 py-3">
        <BackLink href={backHref} label="Zpět na projekt" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{projectName}</p>
          <p className="text-xs text-zinc-400">Pinch / tlačítka · otočte telefon na šířku</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" className={toolBtn} onClick={() => zoomBy(-0.25)}>
            −
          </button>
          <button type="button" className={cn(toolBtn, 'min-w-[4.5rem]')} onClick={resetView}>
            {Math.round(scale * 100)} %
          </button>
          <button type="button" className={toolBtn} onClick={() => zoomBy(0.25)}>
            +
          </button>
        </div>
      </header>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="flex h-full w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`Výkres — ${projectName}`}
            draggable={false}
            className="max-h-full max-w-full select-none object-contain"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    </div>
  );
}
