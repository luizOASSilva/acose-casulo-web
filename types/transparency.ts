export interface Document {
  id: number;
  title: string;
  file_url: string;
}

export interface DocumentCategory {
  id: number;
  name: string;
  description?: string;
  featured: boolean;
  order: number;
  documents: Document[];
}

export interface TransparencyResponse {
  year: number;
  years: number[];
  categories: DocumentCategory[];
  featured: DocumentCategory | null;
}
