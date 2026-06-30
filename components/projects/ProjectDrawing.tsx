'use client';

import Link from 'next/link';

type ProjectDrawingProps = {
  drawing: { url: string; isPdf: boolean } | null;
  projectId: string;
};

export function ProjectDrawing({ drawing, projectId }: ProjectDrawingProps) {
  const viewerHref = `/project/${projectId}/drawing`;

  if (!drawing) {
    return (
      <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-muted">
        Výkres není k dispozici.
      </div>
    );
  }

  return (
    <Link
      href={viewerHref}
      className="block cursor-zoom-in overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
      aria-label="Otevřít výkres na celou obrazovku"
    >
      {drawing.isPdf ? (
        <iframe
          src={drawing.url}
          title="Náhled výkresu"
          className="pointer-events-none h-[min(50vh,420px)] w-full border-0 bg-zinc-100"
        />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={drawing.url}
          alt="Náhled výkresu"
          className="max-h-[min(50vh,420px)] w-full object-contain bg-zinc-50"
        />
      )}
    </Link>
  );
}
