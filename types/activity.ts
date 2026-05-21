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

export type SaveActivityDTO = ActivitySchemaData;
