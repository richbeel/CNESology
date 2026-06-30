# ČNES vision

Field assistant pro **liniové stavby** (silnice, chodníky, sítě pod zemí).

## Cíl produktu

- Body podél trasy: **aktuální vs. cílová výška**, typ práce, stav.
- **Mapa + GPS** v terénu — přehled co zbývá, ne automatické měření hloubky.
- **Verifikace** dokončených úseků (stav, čas, později foto).
- Budoucí směr: hands-free (tablet na mountu → AR brýle).

## Uživatelé a přihlášení

- **Bez registrace** — účty zakládá administrátor (Supabase Auth).
- **Stavbyvedoucí** (`site_manager`): vlastní projekty, sdílení kolegům, tlačítko Nový projekt.
- **Ředitel** (`director`): přehled všech projektů ve firmě.
- Přihlášení: `/login` — jméno + heslo, volitelně zapamatovat (Keychain).

## Stav projektu (barvy)

| Stav | Barva | Význam |
|------|-------|--------|
| `future` | světle modrá | budoucí zakázka |
| `active` | zelená | probíhající |
| `completed` | oranžová | hotová / historická |

## Workflow nové zakázky (plán)

1. Upload PDF koordinační situace
2. Návrh lokace z názvu → **verifikace** uživatelem
3. **Kalibrace 2 body** — GPS v terénu + klik na stejný bod ve výkresu
4. Body výšek, mapa, verifikace práce

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind
- Supabase Auth + Postgres (projekty, role, sdílení)
- Leaflet + OpenStreetMap (MVP mapy)

## Struktura

```
app/login/           přihlášení
app/(app)/dashboard/ projekty stavbyvedoucího
app/(app)/director/  přehled ředitele
app/(app)/project/   nový projekt, detail
lib/types/           AlignmentPoint, Project, Profile
lib/demo/            ukázková trasa (dočasně)
supabase/            migrace, README pro účty
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

Supabase: viz `supabase/README.md`.
