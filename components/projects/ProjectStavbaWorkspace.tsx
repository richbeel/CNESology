import Link from 'next/link';
import { BackLink } from '@/components/ui/BackLink';

type ProjectStavbaWorkspaceProps = {
  projectId: string;
  projectName: string;
  hasDrawing: boolean;
};

const tiles: {
  key: string;
  title: string;
  description: string;
  href: (id: string) => string;
  needsDrawing?: boolean;
}[] = [
  {
    key: 'map',
    title: 'Mapa v terénu',
    description: 'Poloha na trase, body výšek a přehled zbývající práce.',
    href: (id) => `/map?project=${id}`,
  },
  {
    key: 'points',
    title: 'Body výšek',
    description: 'Aktuální a cílové výšky podél staničníků, změna stavu úseků.',
    href: (id) => `/points?project=${id}`,
  },
  {
    key: 'drawing',
    title: 'Výkres',
    description: 'Technická dokumentace na celou obrazovku.',
    href: (id) => `/project/${id}/drawing`,
    needsDrawing: true,
  },
];

export function ProjectStavbaWorkspace({
  projectId,
  projectName,
  hasDrawing,
}: ProjectStavbaWorkspaceProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-3 pb-10">
      <div className="flex items-center justify-between gap-3">
        <BackLink href={`/project/${projectId}`} label="Zpět na projekt" className="shrink-0" />
        <p className="min-w-0 truncate text-right text-sm font-medium text-muted">{projectName}</p>
      </div>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">Terén</p>
        <h1 className="mt-1 text-3xl font-semibold text-zinc-900">Režim stavby</h1>
        <p className="mt-2 max-w-2xl text-muted">Nástroje pro práci na zakázce</p>
      </header>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => {
          const disabled = tile.needsDrawing && !hasDrawing;
          const href = tile.href(projectId);

          if (disabled) {
            return (
              <li
                key={tile.key}
                className="rounded-2xl border border-dashed border-border bg-surface-muted p-5 opacity-70"
              >
                <h2 className="font-semibold text-zinc-900">{tile.title}</h2>
                <p className="mt-2 text-sm text-muted">{tile.description}</p>
                <p className="mt-3 text-xs text-muted">Nejdřív nahrajte výkres v detailu projektu.</p>
              </li>
            );
          }

          return (
            <li key={tile.key}>
              <Link
                href={href}
                className="flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-orange-300 hover:bg-orange-50/40"
              >
                <h2 className="font-semibold text-zinc-900">{tile.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{tile.description}</p>
                <span className="mt-4 text-sm font-semibold text-orange-700">Otevřít →</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
