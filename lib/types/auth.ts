export type UserRole = 'site_manager' | 'director';

export type Profile = {
  id: string;
  login_name: string;
  display_name: string;
  role: UserRole;
  created_at: string;
};

export function roleLabel(role: UserRole): string {
  switch (role) {
    case 'site_manager':
      return 'Stavbyvedoucí';
    case 'director':
      return 'Ředitel';
  }
}

/** Interní e-mail v Supabase Auth (doména musí projít validací Supabase). */
export const AUTH_EMAIL_DOMAIN = 'users.example.com';

/** Přihlašovací jméno → e-mail v Supabase Auth (účty zakládá administrátor). */
export function loginToEmail(login: string): string {
  const trimmed = login.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  return `${trimmed}@${AUTH_EMAIL_DOMAIN}`;
}
