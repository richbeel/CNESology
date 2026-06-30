import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, className, id, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `textarea-${rest.name ?? reactId.replace(/:/g, '')}`;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-zinc-900">
          {label}
        </label>
      ) : null}
      <textarea
        id={inputId}
        ref={ref}
        className={cn(
          'block min-h-28 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-base text-zinc-900',
          'placeholder:text-zinc-400 transition-colors',
          'focus:border-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-800/20',
          error && 'border-red-400',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {hint && !error ? <p className="text-xs text-zinc-500">{hint}</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
});
