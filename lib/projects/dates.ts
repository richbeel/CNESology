/** ISO datum (YYYY-MM-DD) → český formát DD.MM.RRRR. */
export function formatCzechDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${day}.${month}.${year}`;
}

/** Formát období stavby pro zobrazení. */
export function formatConstructionPeriod(
  start: string | null,
  end: string | null,
): string | null {
  if (!start && !end) return null;

  if (start && end) {
    return `${formatCzechDate(start)} – ${formatCzechDate(end)}`;
  }
  if (start) return `od ${formatCzechDate(start)}`;
  return `do ${formatCzechDate(end)}`;
}

/** Hodnota pro skrytý input (ISO). */
export function toDateInputValue(value: string | null): string {
  return value ?? '';
}

export function isoFromDateParts(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

const CZECH_MONTHS = [
  'leden',
  'únor',
  'březen',
  'duben',
  'květen',
  'červen',
  'červenec',
  'srpen',
  'září',
  'říjen',
  'listopad',
  'prosinec',
];

export function formatCzechMonthYear(year: number, month: number): string {
  return `${CZECH_MONTHS[month - 1]} ${year}`;
}

/** Po–Ne, týden od pondělí. */
export const CZECH_WEEKDAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

export function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  let offset = firstDay.getDay() - 1;
  if (offset < 0) offset = 6;

  const cells: (number | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}
