import { baseApi } from './baseApi';

export type UserProfileMain = {
    id: number;
    email: string;
    username: string;
    date_joined: string;
    is_verified: boolean;
};

export type UpdateUserProfileMainRequest = Partial<Pick<UserProfileMain, 'email' | 'username'>>;

export type UserProfileDetails = {
    id: number;
    first_name: string;
    last_name: string;
    bio: string;
    avatar: string | null;
    country: string;
    gender: string;
    user: number;
};

export type UpdateUserProfileDetailsRequest = Partial<
    Pick<UserProfileDetails, 'first_name' | 'last_name' | 'bio' | 'country' | 'gender'>
> & { avatar?: never };

export type PublicUserProfile = {
    id: number;
    username: string;
    is_verified: boolean;
    date_joined: string;
    profile: {
        first_name: string;
        last_name: string;
        bio: string;
        avatar: string | null;
        country: string;
        gender: string;
    };
};

export const userApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getMyProfile: build.query<UserProfileMain, void>({
            query: () => ({ url: 'api/accounts/profile/' }),
            providesTags: [{ type: 'User', id: 'PROFILE' }],
        }),
        updateMyProfile: build.mutation<UserProfileMain, UpdateUserProfileMainRequest>({
            query: (body) => ({
                url: 'api/accounts/profile/',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: [{ type: 'User', id: 'PROFILE' }],
        }),
        getMyProfileDetails: build.query<UserProfileDetails, void>({
            query: () => ({ url: 'api/accounts/profile/details/' }),
            providesTags: [{ type: 'User', id: 'PROFILE_DETAILS' }],
        }),
        updateMyProfileDetails: build.mutation<UserProfileDetails, UpdateUserProfileDetailsRequest | FormData>({
            query: (body) => ({
                url: 'api/accounts/profile/details/',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: [
                { type: 'User', id: 'PROFILE' },
                { type: 'User', id: 'PROFILE_DETAILS' },
            ],
        }),
        getPublicUserProfile: build.query<PublicUserProfile, number>({
            query: (userId) => ({ url: `api/accounts/users/${userId}/profile/` }),
            providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
        }),
    }),
});

export const {
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useGetMyProfileDetailsQuery,
    useUpdateMyProfileDetailsMutation,
    useGetPublicUserProfileQuery,
} = userApi;


