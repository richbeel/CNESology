import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wide text-orange-600">MVP · liniové stavby</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">TrazeField</h1>
      <p className="mt-4 text-lg leading-relaxed text-zinc-600">
        Digitální přehled práce <strong>podél trasy</strong> — body s aktuální a cílovou výškou,
        mapa v terénu a jednoduchá verifikace hotových úseků. Zaměřeno na zemní práce a sítě pod
        vozovkou / chodníkem, ne na budovy.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/map"
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Otevřít mapu v terénu
        </Link>
        <Link
          href="/points"
          className="rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Body trasy a verifikace
        </Link>
      </div>

      <section className="mt-12 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Co je v této verzi</h2>
        <ul className="list-disc space-y-2 pl-5 text-zinc-600">
          <li>Demo trasa s body (staničník, výšky, typ práce, stav)</li>
          <li>Mapa OSM + trasa + barevné body + GPS poloha na tabletu</li>
          <li>Tabulka bodů se změnou stavu (lokálně v prohlížeči)</li>
        </ul>
        <h2 className="pt-2 text-lg font-semibold">Další kroky</h2>
        <ul className="list-disc space-y-2 pl-5 text-zinc-600">
          <li>Import osy a bodů z Excelu / DWG</li>
          <li>Staničník podle polohy na trase</li>
          <li>Backend (Supabase) — zakázky, fotky, tým</li>
          <li>PWA / hands-free pro práci v terénu</li>
        </ul>
      </section>
    </div>
  );
}
