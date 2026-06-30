# TrazeField

Field assistant pro **liniové stavby** (silnice, chodníky, sítě pod zemí).

## Cíl produktu

- Body podél trasy: **aktuální vs. cílová výška**, typ práce, stav.
- **Mapa + GPS** v terénu — přehled co zbývá, ne automatické měření hloubky.
- **Verifikace** dokončených úseků (stav, čas, později foto).
- Budoucí směr: hands-free (tablet na mountu → AR brýle).

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind
- Leaflet + OpenStreetMap (MVP mapy)
- Backend zatím žádný — demo data v `lib/demo/`

## Struktura

```
app/           stránky (/, /map, /points)
components/    UI + FieldMap
lib/types/     AlignmentPoint, výšky, stavy
lib/demo/      ukázková trasa
```

## Konvence

- UI copy česky, formální vykání kde dává smysl u B2B.
- Minimální scope — jedna feature najednou.
- Liniové stavby: staničník, osa, výšky — ne BIM budov.

## Příkazy

```bash
npm run dev    # http://localhost:3000
npm run build
npm run lint
```
