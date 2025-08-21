import { baseApi } from './baseApi';

// Types for search API
export interface SearchUser {
  type: 'user';
  id: number;
  username: string;
  display_name: string;
  avatar?: string;
  followers_count: number;
}

export interface SearchTag {
  type: 'tag';
  name: string;
  display_name: string;
  trips_count: number;
}

export interface SearchSuggestion {
  text: string;
  display_text: string;
  type: 'user' | 'tag';
  user_id?: number; // For user suggestions
  popularity: number;
}

export interface SearchHistory {
  query: string;
  search_type: string;
  results_count: number;
  created_at: string;
}

export interface PopularSearch {
  query: string;
  search_count: number;
  last_searched: string;
}

export type SearchResult = SearchUser | SearchTag;

export interface QuickSearchResponse {
  query: string;
  quick_results: SearchResult[];
  total_results: number;
  has_more: boolean;
}

export interface UnifiedSearchResponse {
  query: string;
  results: SearchResult[];
  total_results: number;
  users_count: number;
  tags_count: number;
}

export interface SuggestionsResponse {
  query?: string;
  suggestions: SearchSuggestion[];
}

export interface SearchHistoryResponse {
  count: number;
  next?: string;
  previous?: string;
  results: SearchHistory[];
}

export interface PopularSearchesResponse {
  popular_searches: PopularSearch[];
  total_count: number;
}

export interface ClearHistoryResponse {
  message: string;
  deleted_count: number;
}

export interface SearchError {
  error: string;
  error_code: string;
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Quick search for real-time results (type as you type)
    quickSearch: build.query<QuickSearchResponse, string>({
      query: (searchQuery) => ({
        url: `api/search/quick/?q=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 120, // 2 minutes cache
    }),

    // Unified search (users and tags together)
    unifiedSearch: build.query<UnifiedSearchResponse, string>({
      query: (searchQuery) => ({
        url: `api/search/?q=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
      }),
      providesTags: ['Search'],
    }),

    // Search users only
    searchUsers: build.query<any, { query: string; page?: number; pageSize?: number }>({
      query: ({ query, page = 1, pageSize = 10 }) => ({
        url: `api/search/users/?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: ['Search', 'User'],
    }),

    // Search tags only
    searchTags: build.query<any, { query: string; page?: number; pageSize?: number }>({
      query: ({ query, page = 1, pageSize = 10 }) => ({
        url: `api/search/tags/?q=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: ['Search'],
    }),

    // Get search suggestions
    getSearchSuggestions: build.query<SuggestionsResponse, { query?: string; limit?: number }>({
      query: ({ query, limit = 10 }) => ({
        url: `api/search/suggestions/?${query ? `q=${encodeURIComponent(query)}&` : ''}limit=${limit}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 300, // 5 minutes cache
    }),

    // Get search history (authenticated users only)
    getSearchHistory: build.query<SearchHistoryResponse, void>({
      query: () => ({
        url: 'api/search/history/',
        method: 'GET',
      }),
      providesTags: ['SearchHistory'],
    }),

    // Clear search history
    clearSearchHistory: build.mutation<ClearHistoryResponse, void>({
      query: () => ({
        url: 'api/search/history/clear/',
        method: 'DELETE',
      }),
      invalidatesTags: ['SearchHistory'],
    }),

    // Get popular searches
    getPopularSearches: build.query<PopularSearchesResponse, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `api/search/popular/?limit=${limit}`,
        method: 'GET',
      }),
      keepUnusedDataFor: 600, // 10 minutes cache
    }),

    // Get user profile (for search results)
    getUserProfile: build.query<any, number>({
      query: (userId) => ({
        url: `api/accounts/users/${userId}/profile/`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // Get trips by tag (for tag search results)
    getTripsByTag: build.query<any, { tagName: string; page?: number; pageSize?: number }>({
      query: ({ tagName, page = 1, pageSize = 20 }) => ({
        url: `api/trip/tags/${encodeURIComponent(tagName)}/trips/?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: (result, error, { tagName }) => [{ type: 'Trip', id: `tag-${tagName}` }],
    }),
  }),
});

export const {
  useQuickSearchQuery,
  useLazyQuickSearchQuery,
  useUnifiedSearchQuery,
  useLazyUnifiedSearchQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useSearchTagsQuery,
  useLazySearchTagsQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  useGetSearchHistoryQuery,
  useClearSearchHistoryMutation,
  useGetPopularSearchesQuery,
  useGetUserProfileQuery,
  useGetTripsByTagQuery,
} = searchApi;

// Export types for use in components
export type {
  SearchUser,
  SearchTag,
  SearchResult,
  SearchSuggestion,
  SearchHistory,
  PopularSearch,
  QuickSearchResponse,
  UnifiedSearchResponse,
  SuggestionsResponse,
  SearchHistoryResponse,
  PopularSearchesResponse,
};
