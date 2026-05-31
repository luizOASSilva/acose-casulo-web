import { api } from '@/lib/api';

export interface Keyword {
  id: number;
  word: string;
}

export interface KeywordFilters {
  busca?: string;
  page?: number;
  per_page?: number;
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

function buildKeywordQuery(filters: KeywordFilters = {}) {
  const params = new URLSearchParams();

  if (filters.busca) {
    params.set('busca', filters.busca);
  }

  if (filters.page) {
    params.set('page', String(filters.page));
  }

  if (filters.per_page) {
    params.set('per_page', String(filters.per_page));
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

export async function getAdminKeywords(
  filters: KeywordFilters = {},
  cookieHeader?: string
): Promise<PaginatedKeywordsResponse> {
  return api.get<PaginatedKeywordsResponse>(
    `/keywords${buildKeywordQuery(filters)}`,
    {
      headers: cookieHeader
        ? {
            Cookie: cookieHeader,
          }
        : undefined,
      cache: 'no-store',
    }
  );
}

export async function getKeywords(
  filters: KeywordFilters = {}
): Promise<PaginatedKeywordsResponse> {
  return api.get<PaginatedKeywordsResponse>(
    `/keywords${buildKeywordQuery(filters)}`,
    {
      cache: 'no-store',
    }
  );
}

export async function getKeyword(keywordId: number) {
  return api.get<{ data: Keyword }>(`/keywords/${keywordId}`, {
    cache: 'no-store',
  });
}

export async function createKeyword(word: string) {
  try {
    const response = await api.post<{ data: Keyword }>('/keywords', {
      word,
    });

    return response.data;
  } catch {
    return null;
  }
}

export async function updateKeyword(keywordId: number, word: string) {
  try {
    const response = await api.put<{ data: Keyword }>(
      `/keywords/${keywordId}`,
      {
        word,
      }
    );

    return response.data;
  } catch {
    return null;
  }
}

export async function deleteKeyword(keywordId: number) {
  try {
    await api.delete<null>(`/keywords/${keywordId}`);

    return true;
  } catch {
    return false;
  }
}
