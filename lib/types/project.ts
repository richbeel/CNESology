export type ProjectStatus = 'future' | 'active' | 'completed';

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  owner_id: string;
  location_hint: string | null;
  description: string | null;
  drawing_path: string | null;
  construction_start: string | null;
  construction_end: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectWithOwner = Project & {
  owner?: {
    display_name: string;
    login_name: string;
  };
};

export function projectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case 'future':
      return 'Budoucí';
    case 'active':
      return 'Probíhající';
    case 'completed':
      return 'Hotový';
  }
}

export function projectStatusStyles(status: ProjectStatus): {
  card: string;
  badge: string;
} {
  switch (status) {
    case 'future':
      return {
        card: 'border-sky-200 bg-sky-50 hover:border-sky-300',
        badge: 'bg-sky-100 text-sky-800',
      };
    case 'active':
      return {
        card: 'border-emerald-200 bg-emerald-50 hover:border-emerald-300',
        badge: 'bg-emerald-100 text-emerald-800',
      };
    case 'completed':
      return {
        card: 'border-orange-200 bg-orange-50 hover:border-orange-300',
        badge: 'bg-orange-100 text-orange-800',
      };
  }
}
