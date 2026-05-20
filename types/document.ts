export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  featured: boolean;
  order?: number;
}

export interface DocumentItem {
  id: number;
  title: string;
  file_url: string;
  year: number | null;
  category_id: number;
  category: DocumentCategory;
  created_at: string;
}

export interface DocumentInput {
  title: string;
  file_url: string;
  category_id: number;
  year: number;
}
