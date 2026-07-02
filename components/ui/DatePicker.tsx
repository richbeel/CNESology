'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import {
  CZECH_WEEKDAY_LABELS,
  formatCzechDate,
  formatCzechMonthYear,
  getCalendarCells,
  isoFromDateParts,
  parseIsoDate,
} from '@/lib/projects/dates';
import { cn } from '@/lib/utils/cn';

export type DatePickerHandle = {
  open: () => void;
  focus: () => void;
};

type DatePickerProps = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  onValueChange?: (iso: string) => void;
  className?: string;
};

type PopoverPosition = {
  top: number;
  left: number;
};

const POPOVER_WIDTH = 288;
const POPOVER_ESTIMATED_HEIGHT = 320;
const VIEWPORT_PADDING = 12;
const GAP = 8;

function useClientMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function todayIso(): string {
  const now = new Date();
  return isoFromDateParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function initialViewDate(iso: string | null): { year: number; month: number } {
  const parsed = iso ? parseIsoDate(iso) : null;
  if (parsed) return { year: parsed.year, month: parsed.month };
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function computePopoverPosition(
  trigger: HTMLElement,
  popoverHeight: number,
): PopoverPosition {
  const rect = trigger.getBoundingClientRect();

  let left = rect.left;
  if (left + POPOVER_WIDTH > window.innerWidth - VIEWPORT_PADDING) {
    left = window.innerWidth - POPOVER_WIDTH - VIEWPORT_PADDING;
  }
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

  const spaceBelow = window.innerHeight - rect.bottom - GAP;
  const spaceAbove = rect.top - GAP;

  if (spaceBelow >= popoverHeight || spaceBelow >= spaceAbove) {
    return { top: rect.bottom + GAP, left };
  }

  return { top: Math.max(VIEWPORT_PADDING, rect.top - popoverHeight - GAP), left };
}

type CalendarPanelProps = {
  view: { year: number; month: number };
  iso: string;
  onSelectDay: (day: number) => void;
  onShiftMonth: (delta: number) => void;
};

function CalendarPanel({ view, iso, onSelectDay, onShiftMonth }: CalendarPanelProps) {
  const cells = getCalendarCells(view.year, view.month);
  const selected = iso ? parseIsoDate(iso) : null;
  const today = todayIso();

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onShiftMonth(-1)}
          className="flex size-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
          aria-label="Předchozí měsíc"
        >
          ‹
        </button>
        <span className="text-sm font-medium capitalize text-zinc-900">
          {formatCzechMonthYear(view.year, view.month)}
        </span>
        <button
          type="button"
          onClick={() => onShiftMonth(1)}
          className="flex size-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100"
          aria-label="Následující měsíc"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
        {CZECH_WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} aria-hidden />;
          }

          const dayIso = isoFromDateParts(view.year, view.month, day);
          const isSelected =
            selected?.year === view.year &&
            selected?.month === view.month &&
            selected?.day === day;
          const isToday = dayIso === today;

          return (
            <button
              key={dayIso}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                'flex size-9 items-center justify-center rounded-lg text-sm transition-colors',
                isSelected
                  ? 'bg-blue-800 font-semibold text-white'
                  : 'text-zinc-900 hover:bg-zinc-100',
                isToday && !isSelected && 'ring-1 ring-blue-800/40',
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </>
  );
}

export const DatePicker = forwardRef(function DatePicker(
  {
    name,
    defaultValue = null,
    placeholder = 'DD.MM.RRRR',
    onValueChange,
    className,
  }: DatePickerProps,
  ref: Ref<DatePickerHandle>,
) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const mounted = useClientMounted();
  const [iso, setIso] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => initialViewDate(defaultValue));
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  useImperativeHandle(ref, () => ({
    open: () => {
      triggerRef.current?.focus();
      setOpen(true);
    },
    focus: () => triggerRef.current?.focus(),
  }));

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const height = popoverRef.current?.offsetHeight ?? POPOVER_ESTIMATED_HEIGHT;
    setPosition(computePopoverPosition(triggerRef.current, height));
  };

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const run = () => {
      if (!triggerRef.current) return;
      const height = popoverRef.current?.offsetHeight ?? POPOVER_ESTIMATED_HEIGHT;
      setPosition(computePopoverPosition(triggerRef.current, height));
    };

    run();
    requestAnimationFrame(run);
  }, [open, view]);

  useEffect(() => {
    if (!open) return;

    const onResize = () => updatePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selectDay = (day: number) => {
    const nextIso = isoFromDateParts(view.year, view.month, day);
    setIso(nextIso);
    setOpen(false);
    onValueChange?.(nextIso);
  };

  const shiftMonth = (delta: number) => {
    setView((current) => {
      let month = current.month + delta;
      let year = current.year;
      while (month < 1) {
        month += 12;
        year -= 1;
      }
      while (month > 12) {
        month -= 12;
        year += 1;
      }
      return { year, month };
    });
  };

  const popover =
    open && mounted
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/25"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Kalendář"
              className="fixed z-[201] w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl"
              style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
            >
              <CalendarPanel
                view={view}
                iso={iso}
                onSelectDay={selectDay}
                onShiftMonth={shiftMonth}
              />
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <div className={cn(className)}>
        <input type="hidden" name={name} value={iso} />
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={cn(
            'flex h-12 w-full items-center rounded-xl border border-zinc-300 bg-white px-4 text-left text-base transition-colors',
            'focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20',
            iso ? 'text-zinc-900' : 'text-zinc-400',
          )}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          {iso ? formatCzechDate(iso) : placeholder}
        </button>
      </div>
      {popover}
    </>
  );
});
