/**
 * Vytvoří uživatele v Supabase Auth + záznam v public.profiles.
 *
 * Potřebuje v .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Project Settings → API → service_role)
 *
 * Použití:
 *   node scripts/create-user.mjs r.bilek test123 "R. Bílek" site_manager
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, '.env.local'), 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* .env.local optional if vars already exported */
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const loginName = process.argv[2] ?? 'r.bilek';
const password = process.argv[3] ?? 'test123';
const displayName = process.argv[4] ?? 'R. Bílek';
const role = process.argv[5] ?? 'site_manager';

if (!url || !serviceKey) {
  if (!url) console.error('Chybí NEXT_PUBLIC_SUPABASE_URL v .env.local');
  if (!serviceKey) {
    console.error('Chybí SUPABASE_SERVICE_ROLE_KEY v .env.local');
    console.error('');
    console.error('1. Otevřete https://supabase.com/dashboard → váš projekt');
    console.error('2. Project Settings → API');
    console.error('3. Zkopírujte klíč „service_role“ (secret, NE anon key)');
    console.error('4. Do .env.local přidejte řádek:');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=eyJ...');
  }
  process.exit(1);
}

if (!['site_manager', 'director'].includes(role)) {
  console.error('Role musí být site_manager nebo director');
  process.exit(1);
}

const AUTH_EMAIL_DOMAIN = 'users.example.com';
const email = loginName.includes('@') ? loginName.toLowerCase() : `${loginName.toLowerCase()}@${AUTH_EMAIL_DOMAIN}`;
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
if (listError) {
  console.error('Nepodařilo se načíst uživatele:', listError.message);
  process.exit(1);
}

const existing = listData.users.find((u) => u.email?.toLowerCase() === email);

let userId = existing?.id;

if (existing) {
  console.log('Auth uživatel už existuje:', email, userId);
  const { error: pwError } = await supabase.auth.admin.updateUserById(userId, { password });
  if (pwError) {
    console.error('Nepodařilo se nastavit heslo:', pwError.message);
    process.exit(1);
  }
  console.log('Heslo aktualizováno.');
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error('Nepodařilo se vytvořit uživatele:', error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log('Auth uživatel vytvořen:', email, userId);
}

const { error: profileError } = await supabase.from('profiles').upsert(
  {
    id: userId,
    login_name: loginName.toLowerCase().replace(/@.+$/, ''),
    display_name: displayName,
    role,
  },
  { onConflict: 'id' },
);

if (profileError) {
  console.error('Nepodařilo se uložit profil:', profileError.message);
  process.exit(1);
}

console.log('Profil uložen.');
console.log('');
console.log('Přihlášení v appce:');
console.log('  jméno:', loginName.toLowerCase().replace(/@.+$/, ''));
console.log('  heslo:', password);
