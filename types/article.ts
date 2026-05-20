import type { ArticleSchemaData } from '@/lib/

export interface Article {
  id: number;
  slug: string;
  author: { name: string };
  summary: string;
  title: string;
  content: string;
  media: {
    url: string;
    alt_text: string;
    caption?: string | null;
  };
  keywords: string[];
  created_at: string;
}

export type SaveArticleDTO = ArticleSchemaData;