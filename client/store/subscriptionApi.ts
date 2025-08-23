import { baseApi } from './baseApi';

// Subscription Plan Types
export type SubscriptionPlan = {
  id: number;
  name: string;
  plan_type: 'premium' | 'pro';
  duration: 'monthly' | 'yearly';
  price: string;
  currency: string;
  description: string;
  features: string[];
  is_active: boolean;
};

// Subscription Status Types
export type SubscriptionStatus = {
  plan: 'free' | 'premium' | 'pro';
  is_active: boolean;
  start_date: string;
  end_date: string;
  days_remaining: number;
  has_verified_badge: boolean;
};

// Payment History Types
export type PaymentHistory = {
  id: number;
  subscription_plan: SubscriptionPlan;
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  created_at: string;
  paymob_order_id?: string;
  paymob_transaction_id?: string;
};

// Create Subscription Request/Response Types
export type CreateSubscriptionRequest = {
  subscription_plan_id: number;
};

export type CreateSubscriptionResponse = {
  message: string;
  payment_id: number;
  iframe_url: string;
  order_id: string;
};

// Subscription API endpoints
export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Get all subscription plans
    getSubscriptionPlans: build.query<SubscriptionPlan[], void>({
      query: () => ({
        url: 'api/accounts/subscription-plans/',
      }),
      providesTags: [{ type: 'SubscriptionPlans', id: 'LIST' }],
    }),

    // Create new subscription
    createSubscription: build.mutation<CreateSubscriptionResponse, CreateSubscriptionRequest>({
      query: (data) => ({
        url: 'api/accounts/create-subscription/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'SubscriptionStatus', id: 'LIST' }],
    }),

    // Get user's subscription status
    getSubscriptionStatus: build.query<SubscriptionStatus, void>({
      query: () => ({
        url: 'api/accounts/subscription-status/',
      }),
      providesTags: [{ type: 'SubscriptionStatus', id: 'LIST' }],
    }),

    // Get payment history
    getPaymentHistory: build.query<PaymentHistory[], void>({
      query: () => ({
        url: 'api/accounts/payment-history/',
      }),
      providesTags: [{ type: 'PaymentHistory', id: 'LIST' }],
    }),

    // Cancel subscription
    cancelSubscription: build.mutation<{ message: string }, void>({
      query: () => ({
        url: 'api/accounts/cancel-subscription/',
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'SubscriptionStatus', id: 'LIST' },
        { type: 'PaymentHistory', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetSubscriptionPlansQuery,
  useCreateSubscriptionMutation,
  useGetSubscriptionStatusQuery,
  useGetPaymentHistoryQuery,
  useCancelSubscriptionMutation,
} = subscriptionApi;