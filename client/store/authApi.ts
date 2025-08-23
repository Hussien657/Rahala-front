import { baseApi } from './baseApi';

type RegisterRequest = {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
};

type LoginRequest = {
    email: string;
    password: string;
};

type JwtLoginResponse = {
    refresh: string;
    access: string;
    user: {
        id: number;
        email: string;
        username: string;
        date_joined: string;
        is_verified: boolean;
    };
};

type LogoutRequest = {
    refresh: string;
};

export const authApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        register: build.mutation<unknown, RegisterRequest>({
            query: (body) => ({
                url: 'api/accounts/register/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        login: build.mutation<JwtLoginResponse, LoginRequest>({
            query: (body) => ({
                url: 'api/accounts/login/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        logout: build.mutation<unknown, LogoutRequest>({
            query: (body) => ({
                url: 'api/accounts/logout/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth', 'User'],
        }),

        resendVerification: build.mutation<unknown, { email: string }>({
            query: (body) => ({
                url: 'api/accounts/resend-verification/',
                method: 'POST',
                body,
            }),
        }),

        requestPasswordReset: build.mutation<unknown, { email: string }>({
            query: (body) => ({
                url: 'api/accounts/password-reset/',
                method: 'POST',
                body,
            }),
        }),

        confirmPasswordReset: build.mutation<unknown, { uidb64: string; token: string; new_password: string }>({
            query: ({ uidb64, token, new_password }) => ({
                url: `api/accounts/password-reset-confirm/${uidb64}/${token}/`,
                method: 'POST',
                body: { new_password, new_password_confirm: new_password },
            }),
        }),

        changePassword: build.mutation<unknown, { current_password: string; new_password: string }>({
            query: (body) => ({
                url: 'api/accounts/change-password/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['User'],
        }),

        verifyEmail: build.mutation<unknown, { uidb64: string; token: string }>({
            query: ({ uidb64, token }) => ({
                url: `api/accounts/verify-email/${uidb64}/${token}/`,
                method: 'GET',
            }),
        }),
    }),
});

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useResendVerificationMutation, useRequestPasswordResetMutation, useConfirmPasswordResetMutation, useChangePasswordMutation, useVerifyEmailMutation } = authApi;


