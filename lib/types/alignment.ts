export type WorkStatus = 'todo' | 'in_progress' | 'done';

export type WorkType = 'excavation' | 'fill' | 'subgrade' | 'utility';

export type AlignmentPoint = {
  id: string;
  /** Zobrazení pro dělníka, např. „12+340“. */
  station: string;
  /** Metráž v metrech od začátku trasy (pro řazení). */
  stationMeters: number;
  lat: number;
  lng: number;
  /** Příčný offset od osy v metrech (volitelné). */
  offsetM?: number;
  /** Evidovaná / zaměřená výška (m n. m.). */
  currentElevationM: number;
  /** Projektová / cílová výška (m n. m.). */
  targetElevationM: number;
  workType: WorkType;
  status: WorkStatus;
  note?: string;
  verifiedAt?: string;
};

export function remainingCutM(point: AlignmentPoint): number {
  return round2(point.currentElevationM - point.targetElevationM);
}

export function workTypeLabel(type: WorkType): string {
  switch (type) {
    case 'excavation':
      return 'Výkop';
    case 'fill':
      return 'Dosyp';
    case 'subgrade':
      return 'Podloží';
    case 'utility':
      return 'Síť';
  }
}

export function statusLabel(status: WorkStatus): string {
  switch (status) {
    case 'todo':
      return 'Nezahájeno';
    case 'in_progress':
      return 'Rozpracováno';
    case 'done':
      return 'Hotovo';
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
