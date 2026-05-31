export interface Keyword {
  id: number;
  word: string;
}

export interface KeywordFilters {
  busca?: string;
  page?: number;
  per_page?: number;
}

export interface KeywordListFilters {
  busca?: string;
}

export interface KeywordPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface PaginatedKeywordsResponse {
  data: Keyword[];
  meta: KeywordPaginationMeta;
}
