import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { updateAccessToken, clearCredentials } from './authSlice';

export const BASE_URL = 'http://127.0.0.1:8000/';

// Prevent multiple simultaneous refresh calls (simple in-file lock)
let refreshPromise: Promise<string | null> | null = null;

const rawBaseQuery = fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const token = state.auth.accessToken || localStorage.getItem('accessToken') || '';
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        // Do not force content-type globally. fetchBaseQuery will set it for JSON bodies,
        // and will omit it for FormData (multipart) so the browser can add the boundary.
        return headers;
    },
    credentials: 'include',
});

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {
    // First try the request
    let result = await rawBaseQuery(args, api, extraOptions);
    if (result.error && result.error.status === 401) {
        const doRefresh = async (): Promise<string | null> => {
            const refreshToken = (api.getState() as RootState).auth.refreshToken || localStorage.getItem('refreshToken');
            if (!refreshToken) return null;
            const refreshResponse = await rawBaseQuery(
                {
                    url: 'api/accounts/token/refresh/',
                    method: 'POST',
                    body: { refresh: refreshToken },
                },
                api,
                extraOptions
            );
            if (refreshResponse.data && (refreshResponse.data as any).access) {
                const newAccess = (refreshResponse.data as any).access as string;
                api.dispatch(updateAccessToken(newAccess));
                return newAccess;
            }
            return null;
        };

        if (!refreshPromise) {
            refreshPromise = (async () => {
                try { return await doRefresh(); } finally { refreshPromise = null; }
            })();
        }
        const refreshed = await refreshPromise;
        if (refreshed) {
            // Retry the original query with new token
            result = await rawBaseQuery(args, api, extraOptions);
        } else {
            api.dispatch(clearCredentials());
        }
    }
    return result;
};

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth', 'User', 'Feed', 'Comments', 'Likes', 'Notifications', 'SubscriptionPlans', 'SubscriptionStatus', 'PaymentHistory'],
    endpoints: () => ({}),
});

export type BaseApi = typeof baseApi;


