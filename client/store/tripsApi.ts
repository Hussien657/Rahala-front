import { baseApi } from './baseApi';
import type { FeedItem } from './feedApi';

export type TourismInfo = {
    description?: string;
    recommended_places?: string[];
    warnings?: string[];
    best_time_to_visit?: string;
    local_tips?: string[];
    currency?: string;
    language?: string;
} | null;

export type TripDetailsResponse = FeedItem & {
    country?: string;
    city?: string;
    tourism_info?: TourismInfo;
};

export type UserTrip = TripDetailsResponse;

export const tripsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        // Fetch trips for the authenticated user
        getMyTrips: build.query<UserTrip[], void>({
            query: () => ({ url: `api/trip/my` }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((r) => ({ type: 'Feed' as const, id: r.id })),
                        { type: 'Feed' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Feed' as const, id: 'LIST' }],
        }),
        getUserTrips: build.query<UserTrip[], number | string>({
            query: (userId) => ({ url: `api/trip/users/${userId}/trips/` }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((r) => ({ type: 'Feed' as const, id: r.id })),
                        { type: 'Feed' as const, id: 'LIST' },
                    ]
                    : [{ type: 'Feed' as const, id: 'LIST' }],
        }),
        getTripById: build.query<TripDetailsResponse, string | number>({
            query: (tripId) => ({ url: `api/trip/${tripId}/` }),
            providesTags: (_result, _error, id) => [{ type: 'Feed', id }],
        }),
        generateTourismInfo: build.mutation<TripDetailsResponse, { tripId: string | number; force?: boolean; language?: string }>({
            query: ({ tripId, ...body }) => ({
                url: `api/trip/${tripId}/tourism-info/`,
                method: 'POST',
                body: Object.keys(body).length ? body : undefined,
            }),
            invalidatesTags: (_res, _err, arg) => [{ type: 'Feed' as const, id: arg.tripId }],
        }),
        createTrip: build.mutation<TripDetailsResponse, FormData>({
            query: (formData) => ({
                url: 'api/trip/create/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'Feed', id: 'LIST' }],
        }),
        deleteTrip: build.mutation<unknown, string | number>({
            query: (tripId) => ({
                url: `api/trip/${tripId}/delete/`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Feed', id: 'LIST' }],
        }),
        addTripImages: build.mutation<unknown, { tripId: string | number; formData: FormData }>({
            query: ({ tripId, formData }) => ({
                url: `api/trip/${tripId}/images/`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (_res, _err, arg) => [{ type: 'Feed' as const, id: arg.tripId }],
        }),
        addTripVideos: build.mutation<unknown, { tripId: string | number; formData: FormData }>({
            query: ({ tripId, formData }) => ({
                url: `api/trip/${tripId}/videos/`,
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: (_res, _err, arg) => [{ type: 'Feed' as const, id: arg.tripId }],
        }),
        deleteTripImage: build.mutation<unknown, { imageId: string | number }>({
            query: ({ imageId }) => ({
                url: `api/trip/images/${imageId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: [],
        }),
        deleteTripVideo: build.mutation<unknown, { videoId: string | number }>({
            query: ({ videoId }) => ({
                url: `api/trip/videos/${videoId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: [],
        }),
        addTripTags: build.mutation<unknown, { tripId: string | number; tags: string[] }>({
            query: ({ tripId, tags }) => ({
                url: `api/trip/${tripId}/tags/`,
                method: 'POST',
                body: { tags },
            }),
            invalidatesTags: (_res, _err, arg) => [{ type: 'Feed' as const, id: arg.tripId }],
        }),
        deleteTripTag: build.mutation<unknown, { tripId: string | number; tagId: string | number }>({
            query: ({ tripId, tagId }) => ({
                url: `api/trip/${tripId}/tags/${tagId}/`,
                method: 'DELETE',
            }),
            invalidatesTags: (_res, _err, arg) => [{ type: 'Feed' as const, id: arg.tripId }],
        }),
    }),
});

export const {
    useGetMyTripsQuery,
    useGetUserTripsQuery,
    useGetTripByIdQuery,
    useGenerateTourismInfoMutation,
    useCreateTripMutation,
    useDeleteTripMutation,
    useAddTripImagesMutation,
    useAddTripVideosMutation,
    useDeleteTripImageMutation,
    useDeleteTripVideoMutation,
    useAddTripTagsMutation,
    useDeleteTripTagMutation,
} = tripsApi;



