'use client';

import dynamic from 'next/dynamic';
import { DEMO_ALIGNMENT_POLYLINE, DEMO_POINTS } from '@/lib/demo/alignment';
import { remainingCutM, statusLabel, workTypeLabel } from '@/lib/types/alignment';

const FieldMap = dynamic(() => import('@/components/map/FieldMap').then((m) => m.FieldMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
      Načítám mapu…
    </div>
  ),
});

export default function MapPage() {
  const open = DEMO_POINTS.filter((p) => p.status !== 'done').length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Mapa v terénu</h1>
        <p className="mt-1 text-zinc-600">
          Trasa, body s výškami a vaše poloha (GPS). Oranžová = zbývá srazit, zelená = hotovo.
        </p>
        <p className="mt-2 text-sm font-medium text-zinc-800">Otevřené body: {open}</p>
      </div>

      <div className="h-[min(70vh,640px)] overflow-hidden rounded-xl border border-zinc-200 shadow-sm">
        <FieldMap route={DEMO_ALIGNMENT_POLYLINE} points={DEMO_POINTS} />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold text-zinc-900">Nejbližší úkoly (demo)</h2>
        <ul className="mt-3 space-y-2">
          {DEMO_POINTS.filter((p) => p.status !== 'done').map((point) => (
            <li
              key={point.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm"
            >
              <span className="font-medium">{point.station}</span>
              <span className="text-zinc-600">{workTypeLabel(point.workType)}</span>
              <span className="text-zinc-800">zbývá {remainingCutM(point)} m</span>
              <span className="text-zinc-500">{statusLabel(point.status)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
