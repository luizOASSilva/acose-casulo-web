export interface Article {
  id: number;
  slug: string;
  author: {
    name: string;
  };
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

export interface SaveArticleDTO {
  title: string;
  summary: string;
  content: string;
  image_url: string;
  image_description: string;
  image_caption?: string | null;
  keywords: string[];
}
