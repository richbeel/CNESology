'use client';

import { useMemo, useState } from 'react';
import { DEMO_POINTS } from '@/lib/demo/alignment';
import type { AlignmentPoint, WorkStatus } from '@/lib/types/alignment';
import { remainingCutM, statusLabel, workTypeLabel } from '@/lib/types/alignment';

const STATUS_CYCLE: WorkStatus[] = ['todo', 'in_progress', 'done'];

function nextStatus(current: WorkStatus): WorkStatus {
  const i = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(i + 1) % STATUS_CYCLE.length] ?? 'todo';
}

export default function PointsPage() {
  const [points, setPoints] = useState<AlignmentPoint[]>(DEMO_POINTS);

  const stats = useMemo(() => {
    const done = points.filter((p) => p.status === 'done').length;
    return { done, total: points.length };
  }, [points]);

  function verifyPoint(id: string) {
    setPoints((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: nextStatus(p.status),
              verifiedAt: p.status !== 'done' ? new Date().toISOString() : p.verifiedAt,
            }
          : p,
      ),
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-semibold text-zinc-900">Body trasy</h1>
      <p className="mt-1 text-zinc-600">
        Přehled výšek a verifikace — kliknutím cyklujete stav (demo, data jen v prohlížeči).
      </p>
      <p className="mt-2 text-sm font-medium text-zinc-800">
        Hotovo: {stats.done} / {stats.total}
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-600">
            <tr>
              <th className="px-3 py-2 font-medium">Staničník</th>
              <th className="px-3 py-2 font-medium">Typ</th>
              <th className="px-3 py-2 font-medium">Aktuální</th>
              <th className="px-3 py-2 font-medium">Cíl</th>
              <th className="px-3 py-2 font-medium">Zbývá</th>
              <th className="px-3 py-2 font-medium">Stav</th>
              <th className="px-3 py-2 font-medium">Akce</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={point.id} className="border-b border-zinc-100 last:border-0">
                <td className="px-3 py-2 font-medium">{point.station}</td>
                <td className="px-3 py-2">{workTypeLabel(point.workType)}</td>
                <td className="px-3 py-2">{point.currentElevationM} m</td>
                <td className="px-3 py-2">{point.targetElevationM} m</td>
                <td className="px-3 py-2">{remainingCutM(point)} m</td>
                <td className="px-3 py-2">{statusLabel(point.status)}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => verifyPoint(point.id)}
                    className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
                  >
                    Změnit stav
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
