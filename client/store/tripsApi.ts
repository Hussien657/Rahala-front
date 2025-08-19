import { baseApi } from './baseApi';
import type { FeedItem } from './feedApi';

// Trip details share the same shape as FeedItem returned in the feed
export type TripDetailsResponse = FeedItem;

export const tripsApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getTripById: build.query<TripDetailsResponse, string | number>({
            query: (tripId) => ({ url: `api/trip/${tripId}/` }),
            providesTags: (_result, _error, id) => [{ type: 'Feed', id }],
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
    useGetTripByIdQuery,
    useCreateTripMutation,
    useDeleteTripMutation,
    useAddTripImagesMutation,
    useAddTripVideosMutation,
    useDeleteTripImageMutation,
    useDeleteTripVideoMutation,
    useAddTripTagsMutation,
    useDeleteTripTagMutation,
} = tripsApi;



