import { baseApi } from './baseApi';

export type TripStats = {
    likes_count: number;
    comments_count: number;
    saves_count: number;
    shares_count: number;
    is_liked: boolean;
    is_saved: boolean;
};

export type TripCommentUser = {
    id: number;
    email: string;
    username: string;
    date_joined: string;
    is_verified: boolean;
};

export type TripComment = {
    id: number;
    user: TripCommentUser;
    trip: number;
    content: string;
    parent: number | null;
    created_at: string;
    updated_at: string;
    is_reply: boolean;
    replies: TripComment[];
    replies_count: number;
};

export type PaginatedComments = {
    count: number;
    next: string | null;
    previous: string | null;
    results: TripComment[];
};

export type TripLikeItem = {
    id: number;
    user: TripCommentUser;
    trip: number;
    created_at: string;
    is_following: boolean;
};

export type PaginatedLikes = {
    count: number;
    next: string | null;
    previous: string | null;
    results: TripLikeItem[];
};

export type FollowRelation = {
    id: number;
    follower: TripCommentUser;
    following: TripCommentUser;
    created_at: string;
};

export type PaginatedFollows = {
    count: number;
    next: string | null;
    previous: string | null;
    results: FollowRelation[];
};

export type UserStats = {
    followers_count: number;
    following_count: number;
    trips_count: number;
    is_following: boolean;
};

export type NotificationUser = TripCommentUser;

export type NotificationItem = {
    id: number;
    recipient: NotificationUser;
    sender: NotificationUser;
    notification_type: 'like' | 'comment' | 'follow' | 'share';
    trip: number | null;
    comment: number | null;
    is_read: boolean;
    created_at: string;
};

export type PaginatedNotifications = {
    count: number;
    next: string | null;
    previous: string | null;
    results: NotificationItem[];
};

export type UnreadCountResponse = {
    unread_count: number;
};

export type RecentNotificationsResponse = {
    notifications: NotificationItem[];
    count: number;
};

export type NotificationSettings = {
    likes_enabled: boolean;
    comments_enabled: boolean;
    follows_enabled: boolean;
    shares_enabled: boolean;
    email_notifications: boolean;
    push_notifications: boolean;
};

export type MessageResponse = {
    message: string;
    count?: number;
};

export type TopTravelerUser = {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    location: string;
    tripsCount: number;
    followersCount: number;
    isFollowing: boolean;
    isVerified: boolean;
};

export type PaginatedTopTravelers = {
    count: number;
    next: string | null;
    previous: string | null;
    results: TopTravelerUser[];
};

export type SuggestedTravelerUser = {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    location: string;
    tripsCount: number;
    followersCount: number;
    isFollowing: boolean;
    isVerified: boolean;
};

export type PaginatedSuggestedTravelers = {
    count: number;
    next: string | null;
    previous: string | null;
    results: SuggestedTravelerUser[];
};

export const interactionsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTripStats: build.query<TripStats, string | number>({
            query: (tripId) => ({
                url: `api/interactions/stats/trip/${tripId}/`,
                method: 'GET',
            }),
        }),
        getUserFollowers: build.query<PaginatedFollows, string | number>({
            query: (userId) => ({
                url: `api/interactions/followers/${userId}/`,
                method: 'GET',
            }),
            providesTags: (_res, _err, id) => [{ type: 'User' as const, id }],
        }),
        getUserFollowing: build.query<PaginatedFollows, string | number>({
            query: (userId) => ({
                url: `api/interactions/following/${userId}/`,
                method: 'GET',
            }),
            providesTags: (_res, _err, id) => [{ type: 'User' as const, id }],
        }),
        getUserStats: build.query<UserStats, string | number>({
            query: (userId) => ({
                url: `api/interactions/stats/user/${userId}/`,
                method: 'GET',
            }),
            providesTags: (_res, _err, id) => [{ type: 'User' as const, id }],
        }),
        likeTrip: build.mutation<unknown, { trip_id: number }>({
            query: (body) => ({
                url: 'api/interactions/like/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Feed'],
        }),
        unlikeTrip: build.mutation<unknown, { trip_id: number }>({
            query: (body) => ({
                url: 'api/interactions/unlike/',
                method: 'DELETE',
                body,
            }),
            invalidatesTags: ['Feed'],
        }),
        saveTrip: build.mutation<unknown, { trip_id: number }>({
            query: (body) => ({
                url: 'api/interactions/save/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Feed'],
        }),
        unsaveTrip: build.mutation<unknown, { trip_id: number }>({
            query: (body) => ({
                url: 'api/interactions/unsave/',
                method: 'DELETE',
                body,
            }),
            invalidatesTags: ['Feed'],
        }),
        createComment: build.mutation<TripComment, { trip_id: number; content: string; trip: number; }>({
            query: (body) => ({
                url: 'api/interactions/comment/',
                method: 'POST',
                body,
            }),
            invalidatesTags: (_res, _err, arg) => [
                { type: 'Comments' as const, id: arg.trip_id },
                { type: 'Feed' as const, id: arg.trip_id },
            ],
        }),
        getTripComments: build.query<PaginatedComments, string | number>({
            query: (tripId) => ({
                url: `api/interactions/comments/${tripId}/`,
                method: 'GET',
            }),
            providesTags: (_res, _err, id) => [
                { type: 'Comments' as const, id },
            ],
        }),
        getTripLikes: build.query<PaginatedLikes, string | number>({
            query: (tripId) => ({
                url: `api/interactions/likes/${tripId}/`,
                method: 'GET',
            }),
            providesTags: (_res, _err, id) => [
                { type: 'Likes' as const, id },
            ],
        }),
        followUser: build.mutation<unknown, { user_id: number }>({
            query: (body) => ({
                url: 'api/interactions/follow/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Likes', 'User', 'TopTravelers'],
        }),
        unfollowUser: build.mutation<unknown, { user_id: number }>({
            query: (body) => ({
                url: 'api/interactions/unfollow/',
                method: 'DELETE',
                body,
            }),
            invalidatesTags: ['Likes', 'User', 'TopTravelers'],
        }),
        updateComment: build.mutation<TripComment, { pk: number; content: string; trip_id: number }>({
            query: ({ pk, content }) => ({
                url: `api/interactions/comment/${pk}/`,
                method: 'PATCH',
                body: { content },
            }),
            invalidatesTags: (_res, _err, arg) => [
                { type: 'Comments' as const, id: arg.trip_id },
            ],
        }),
        deleteComment: build.mutation<{ success?: boolean }, { pk: number; trip_id: number }>({
            query: ({ pk }) => ({
                url: `api/interactions/comment/${pk}/delete/`,
                method: 'DELETE',
            }),
            invalidatesTags: (_res, _err, arg) => [
                { type: 'Comments' as const, id: arg.trip_id },
            ],
        }),
        getNotifications: build.query<PaginatedNotifications, { page?: number; page_size?: number } | void>({
            query: (params) => ({
                url: 'api/interactions/notifications/',
                method: 'GET',
                params: params ? (params as Record<string, any>) : undefined,
            }),
            providesTags: ['Notifications'],
        }),
        markNotificationRead: build.mutation<unknown, { id: number } | number>({
            query: (arg) => {
                const id = typeof arg === 'number' ? arg : arg.id;
                return {
                    url: `api/interactions/notifications/${id}/read/`,
                    method: 'POST',
                };
            },
            invalidatesTags: ['Notifications'],
        }),
        markAllNotificationsRead: build.mutation<MessageResponse, void>({
            query: () => ({
                url: 'api/interactions/notifications/read-all/',
                method: 'POST',
            }),
            invalidatesTags: ['Notifications'],
        }),
        getUnreadNotificationsCount: build.query<UnreadCountResponse, void>({
            query: () => ({
                url: 'api/interactions/notifications/unread-count/',
                method: 'GET',
            }),
            providesTags: ['Notifications'],
        }),
        getRecentNotifications: build.query<RecentNotificationsResponse, { limit?: number } | void>({
            query: (params) => ({
                url: 'api/interactions/notifications/recent/',
                method: 'GET',
                params: params ? (params as Record<string, any>) : undefined,
            }),
            providesTags: ['Notifications'],
        }),
        markNotificationReadRealtime: build.mutation<MessageResponse, { id: number } | number>({
            query: (arg) => {
                const id = typeof arg === 'number' ? arg : arg.id;
                return {
                    url: `api/interactions/notifications/${id}/read-realtime/`,
                    method: 'POST',
                };
            },
            invalidatesTags: ['Notifications'],
        }),
        deleteNotification: build.mutation<MessageResponse, { id: number } | number>({
            query: (arg) => {
                const id = typeof arg === 'number' ? arg : arg.id;
                return {
                    url: `api/interactions/notifications/${id}/delete/`,
                    method: 'DELETE',
                };
            },
            invalidatesTags: ['Notifications'],
        }),
        getNotificationSettings: build.query<NotificationSettings, void>({
            query: () => ({
                url: 'api/interactions/notifications/settings/',
                method: 'GET',
            }),
        }),
        updateNotificationSettings: build.mutation<MessageResponse, Partial<NotificationSettings>>({
            query: (settings) => ({
                url: 'api/interactions/notifications/settings/update/',
                method: 'POST',
                body: settings,
            }),
        }),
        getTopTravelers: build.query<PaginatedTopTravelers, { page?: number; page_size?: number } | void>({
            query: (params) => ({
                url: 'api/interactions/travelers/top/',
                method: 'GET',
                params: params ? (params as Record<string, any>) : undefined,
            }),
            providesTags: ['TopTravelers'],
        }),
        getSuggestedTravelers: build.query<PaginatedSuggestedTravelers, { page?: number; page_size?: number } | void>({
            query: (params) => ({
                url: 'api/interactions/travelers/suggested/',
                method: 'GET',
                params: params ? (params as Record<string, any>) : undefined,
            }),
            providesTags: ['SuggestedTravelers'],
        }),
    }),
});

export const {
    useGetTripStatsQuery,
    useLikeTripMutation,
    useUnlikeTripMutation,
    useSaveTripMutation,
    useUnsaveTripMutation,
    useCreateCommentMutation,
    useGetTripCommentsQuery,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useGetTripLikesQuery,
    useFollowUserMutation,
    useUnfollowUserMutation,
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    useGetUnreadNotificationsCountQuery,
    useGetRecentNotificationsQuery,
    useMarkNotificationReadRealtimeMutation,
    useDeleteNotificationMutation,
    useGetNotificationSettingsQuery,
    useUpdateNotificationSettingsMutation,
    useGetTopTravelersQuery,
    useGetSuggestedTravelersQuery
} = interactionsApi;
export const { useGetUserFollowersQuery, useGetUserFollowingQuery, useGetUserStatsQuery } = interactionsApi;


