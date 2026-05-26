import type { ActivitySchemaData } from '@/schemas/activity.schema';

export type Weekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ActivitySchedule {
  id?: number;
  weekday: Weekday;
  start_time: string;
  end_time: string;
}

export interface OccupiedActivitySchedule {
  id: number;
  activity_id: number;
  activity_title: string | null;
  weekday: Weekday;
  start_time: string;
  end_time: string;
}

export interface Activity {
  id: number;
  slug?: string;

  title: string;
  content: string;

  likes?: number;
  likes_count?: number;

  is_liked?: boolean;
  liked?: boolean;

  created_at?: string;
  updated_at?: string;

  schedules?: ActivitySchedule[];

  media?: {
    url?: string;
    alt_text?: string;
    caption?: string | null;
  };
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface PaginatedActivitiesResponse {
  data: Activity[];
  meta: PaginationMeta;
  links?: PaginationLinks;
}

export interface AdminActivityFilters {
  busca?: string;
  dia?: Weekday | '';
  inicio?: string;
  fim?: string;
  ordem?: 'recentes' | 'antigas' | 'curtidas' | 'az';
  page?: number;
  per_page?: number;
}

export interface ActivityListFilters {
  busca?: string;
  dia?: Weekday | '';
  inicio?: string;
  fim?: string;
  ordem?: 'recentes' | 'antigas' | 'curtidas' | 'az';
}

export type SaveActivityDTO = ActivitySchemaData;
