import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
    id: number;
    email: string;
    username: string;
    date_joined?: string;
    is_verified?: boolean;
};

export interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    user: AuthUser | null;
}

const initialState: AuthState = {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: (() => {
        const raw = localStorage.getItem('authUser');
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    })(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
            localStorage.setItem('accessToken', action.payload);
        },
        setCredentials: (
            state,
            action: PayloadAction<{ access: string; refresh: string; user: AuthUser }>,
        ) => {
            state.accessToken = action.payload.access;
            state.refreshToken = action.payload.refresh;
            state.user = action.payload.user;
            localStorage.setItem('accessToken', action.payload.access);
            localStorage.setItem('refreshToken', action.payload.refresh);
            localStorage.setItem('authUser', JSON.stringify(action.payload.user));
        },
        clearCredentials: (state) => {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authUser');
        },
    },
});

export const { setCredentials, clearCredentials, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;


