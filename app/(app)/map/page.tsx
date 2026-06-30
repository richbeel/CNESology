'use client';

import dynamic from 'next/dynamic';
import { DEMO_ALIGNMENT_POLYLINE, DEMO_POINTS } from '@/lib/demo/alignment';
import { remainingCutM, statusLabel, workTypeLabel } from '@/lib/types/alignment';

const FieldMap = dynamic(() => import('@/components/map/FieldMap').then((m) => m.FieldMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-2xl bg-surface-muted text-muted">
      Načítám mapu…
    </div>
  ),
});

export default function MapPage() {
  const open = DEMO_POINTS.filter((p) => p.status !== 'done').length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Mapa v terénu (demo)</h1>
        <p className="mt-1 text-muted">
          Trasa, body s výškami a vaše poloha (GPS). Oranžová = zbývá srazit, zelená = hotovo.
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">Otevřené body: {open}</p>
      </div>

      <div className="h-[min(70vh,640px)] overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <FieldMap route={DEMO_ALIGNMENT_POLYLINE} points={DEMO_POINTS} />
      </div>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <h2 className="font-semibold">Nejbližší úkoly (demo)</h2>
        <ul className="mt-3 space-y-2">
          {DEMO_POINTS.filter((p) => p.status !== 'done').map((point) => (
            <li
              key={point.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-3 py-2 text-sm"
            >
              <span className="font-medium text-foreground">{point.station}</span>
              <span className="text-muted">{workTypeLabel(point.workType)}</span>
              <span className="text-foreground">zbývá {remainingCutM(point)} m</span>
              <span className="text-muted">{statusLabel(point.status)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
