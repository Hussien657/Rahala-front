import { baseApi } from './baseApi';

export type SubscriptionPlan = {
    id: number;
    name: string;
    plan_type: 'premium' | 'pro' | string;
    duration: 'monthly' | 'yearly' | string;
    price: string; // e.g. "99.00"
    currency: string; // e.g. "EGP"
    description: string;
    features: string[];
    is_active: boolean;
};

export type CreateSubscriptionRequest = {
    subscription_plan_id: number;
};

export type CreateSubscriptionResponse = {
    message: string;
    payment_id: number;
    iframe_url: string;
    order_id: number;
};

export type PaymobWebhookRequest = {
    id: number;
    success: boolean;
    status: string;
    amount_cents: number;
    currency: string;
    delivery_needed: boolean;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    integration_id: number;
    order: { id: number };
    [key: string]: any;
};

export type PaymobWebhookResponse = {
    message: string;
};

export type SubscriptionStatus = {
    plan: string;
    is_active: boolean;
    start_date?: string;
    end_date?: string;
    days_remaining?: number;
    has_verified_badge?: boolean;
};

export const subscriptionApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getSubscriptionPlans: build.query<SubscriptionPlan[], void>({
            query: () => ({ url: 'api/accounts/subscription-plans/', method: 'GET' }),
            providesTags: ['Subscription'],
        }),

        createSubscription: build.mutation<CreateSubscriptionResponse, CreateSubscriptionRequest>({
            query: (body) => ({
                url: 'api/accounts/create-subscription/',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Subscription'],
        }),

        sendPaymobWebhook: build.mutation<PaymobWebhookResponse, { payload: PaymobWebhookRequest; hmac: string }>({
            query: ({ payload, hmac }) => ({
                url: 'api/accounts/paymob-webhook/',
                method: 'POST',
                body: payload,
                headers: { 'X-PayMob-Signature': hmac },
            }),
        }),

        getSubscriptionStatus: build.query<SubscriptionStatus, void>({
            query: () => ({ url: 'api/accounts/subscription-status/', method: 'GET' }),
            providesTags: ['Subscription'],
        }),

        cancelSubscription: build.mutation<{ message: string }, void>({
            query: () => ({ url: 'api/accounts/cancel-subscription/', method: 'POST' }),
            invalidatesTags: ['Subscription'],
        }),
    }),
});

export const {
    useGetSubscriptionPlansQuery,
    useCreateSubscriptionMutation,
    useSendPaymobWebhookMutation,
    useGetSubscriptionStatusQuery,
    useCancelSubscriptionMutation,
} = subscriptionApi;


