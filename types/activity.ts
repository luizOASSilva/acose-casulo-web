export interface Activity {
  id: number;
  slug?: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  media?: {
    url?: string;
    alt_text?: string;
    caption?: string;
  };
}