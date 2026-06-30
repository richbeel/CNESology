# Supabase — přihlášení a projekty

## 1. Projekt na supabase.com

1. Vytvořte nový projekt (region EU doporučeno).
2. V Supabase otevřete **SQL Editor** → **New query**.
3. **Ne** vkládejte název souboru (`migrations/001_...`) — to není SQL.
4. Otevřete v Cursoru soubor `supabase/migrations/001_auth_and_projects.sql`, **zkopírujte celý obsah** (od `-- ČNES vision` až do konce) a vložte do SQL Editoru.
5. Klikněte **Run** (nebo Ctrl+Enter). Mělo by se zobrazit *Success. No rows returned*.
6. Stejným postupem spusťte **celý** soubor `supabase/migrations/002_project_details.sql` (Ctrl+A v souboru → vložit → Run). Nepouštějte jen vybraný úsek.
   - Když uvidíte `policy … already exists`, nejdřív spusťte `002_reset_storage_policies.sql` a pak znovu celý `002`.
7. Poté spusťte `supabase/migrations/003_projects_select_owner.sql` (oprava vytváření projektů).
8. Pokud upload výkresu hlásí **row-level security**, spusťte `supabase/migrations/004_storage_upload_rls_fix.sql`.
9. Pro datum stavby spusťte `supabase/migrations/005_project_construction_dates.sql`.

Pokud vidíte `syntax error at or near "migrations"`, do editoru jste vložili cestu k souboru — zkuste znovu krok 4.

## 2. Proměnné prostředí

V kořeni repozitáře vytvořte `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://VÁŠ_PROJEKT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=váš_anon_key
SUPABASE_SERVICE_ROLE_KEY=váš_service_role_key
```

Klíče najdete v Supabase → **Project Settings → API** (`service_role` jen pro skripty, nikdy do frontendu).

## 3. Vytvoření účtů (bez registrace v appce)

**Rychle — skript** (po doplnění `SUPABASE_SERVICE_ROLE_KEY`):

```bash
npm run create-user -- r.bilek test123 "R. Bílek" site_manager
```

**Nebo ručně** v Supabase → **Authentication → Users → Add user**:

| Pole | Příklad stavbyvedoucí | Příklad ředitel |
|------|------------------------|-----------------|
| Email | `novak@users.example.com` | `reditel@users.example.com` |
| Heslo | (přidělíte) | (přidělíte) |

Do appky se uživatel přihlašuje **přihlašovacím jménem** `novak` nebo `r.bilek` (bez domény) — appka doplní `@users.example.com`.

Po vytvoření uživatele v Auth doplňte profil (SQL Editor, `id` zkopírujte z Auth):

```sql
insert into public.profiles (id, login_name, display_name, role)
values
  ('UUID_UŽIVATELE', 'novak', 'Ing. Novák', 'site_manager');

insert into public.profiles (id, login_name, display_name, role)
values
  ('UUID_ŘEDITELE', 'reditel', 'Ing. Ředitel', 'director');
```

## 4. Ukázkové projekty (volitelné)

```sql
insert into public.projects (name, status, owner_id, location_hint)
values
  ('Parkoviště Dukelská', 'active', 'UUID_STAVBYVEDOUCÍHO', 'Třinec, ul. Dukelská'),
  ('Kanalizace – etapa 2', 'future', 'UUID_STAVBYVEDOUCÍHO', 'Třinec'),
  ('Rekonstrukce chodníku', 'completed', 'UUID_STAVBYVEDOUCÍHO', 'Třinec');
```

## 5. Role

| Role | Co vidí |
|------|---------|
| `site_manager` | vlastní + sdílené projekty, tlačítko Nový projekt |
| `director` | všechny projekty ve firmě |

Sdílení: vlastník projektu může přidat další stavbyvedoucí do `project_shares` (UI doplníme).

## 6. Zapamatování hesla

Formulář používá `autocomplete="username"` a `autocomplete="current-password"` — iPhone Keychain a prohlížeče nabídnou uložení hesla automaticky.

Checkbox **Zapamatovat přihlášení** ukládá session do `localStorage` (trvalé) vs. `sessionStorage` (po zavření prohlížeče).
