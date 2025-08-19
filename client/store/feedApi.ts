import { baseApi } from './baseApi';

export type FeedMedia = {
    id: number;
    image?: string;
    video?: string;
};

export type FeedTag = {
    id: number;
    tripTag: string;
};

export type FeedItem = {
    id: number;
    user: string;
    caption: string;
    location: string;
    created_at: string;
    updated_at: string;
    images: FeedMedia[];
    videos: FeedMedia[];
    tags: FeedTag[];
};

export type PaginatedResponse<T> = {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
};

export const feedApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getFeed: build.query<PaginatedResponse<FeedItem>, void>({
            query: () => ({ url: 'api/interactions/feed' }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map((r) => ({ type: 'Feed' as const, id: r.id })),
                        { type: 'Feed' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Feed' as const, id: 'LIST' }],
        }),
        getExplore: build.query<PaginatedResponse<FeedItem>, { page?: number; page_size?: number } | void>({
            query: (params) => ({
                url: 'api/interactions/explore/',
                params: params ? (params as Record<string, any>) : undefined,
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.results.map((r) => ({ type: 'Feed' as const, id: r.id })),
                        { type: 'Feed' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Feed' as const, id: 'LIST' }],
        }),
    }),
});

export const { useGetFeedQuery, useGetExploreQuery } = feedApi;


