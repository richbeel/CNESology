import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

type BackLinkProps = {
  href: string;
  label: string;
  className?: string;
};

export function BackLink({ href, label, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full bg-blue-800 text-white shadow-sm transition-colors hover:bg-blue-900',
        className,
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
