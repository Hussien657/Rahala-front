import { useEffect } from 'react';
import { Check, Crown, Shield, Star, Zap, BadgeCheck, Calendar as CalendarIcon, TimerReset, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetSubscriptionPlansQuery, useCreateSubscriptionMutation, type SubscriptionPlan, useGetSubscriptionStatusQuery, useCancelSubscriptionMutation } from '@/store/subscriptionApi';
import { useLanguage } from '@/contexts/LanguageContext';

const iconForPlan = (plan: SubscriptionPlan) => {
    if (plan.plan_type === 'premium') return Crown;
    if (plan.plan_type === 'pro') return Shield;
    return Star;
};

const accentForPlan = (plan: SubscriptionPlan) => {
    if (plan.plan_type === 'premium') return 'from-yellow-500 via-amber-500 to-orange-500';
    if (plan.plan_type === 'pro') return 'from-blue-600 via-indigo-600 to-purple-600';
    return 'from-primary via-primary to-primary/70';
};

const SubscriptionPlans = () => {
    const { direction, t } = useLanguage();
    const { data: plans, isLoading, isError, refetch } = useGetSubscriptionPlansQuery();
    const [createSubscription, { isLoading: isCreating }] = useCreateSubscriptionMutation();
    const { data: status, isLoading: isStatusLoading } = useGetSubscriptionStatusQuery();
    const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleBuy = async (planId: number) => {
        try {
            if (status?.is_active) return;
            const resp = await createSubscription({ subscription_plan_id: planId }).unwrap();
            // Persist order id to reference on callback page
            localStorage.setItem('lastSubscriptionOrderId', String(resp.order_id));
            // Redirect to payment iframe URL
            window.location.href = resp.iframe_url;
        } catch (e) {
            console.error('Failed to create subscription', e);
        }
    };

    const handleCancel = async () => {
        try {
            await cancelSubscription().unwrap();
        } catch (e) {
            console.error('Failed to cancel subscription', e);
        }
    };

    const renderPlan = (plan: SubscriptionPlan) => {
        const Icon = iconForPlan(plan);
        const gradient = accentForPlan(plan);
        return (
            <Card key={plan.id} className="overflow-hidden hover:shadow-xl transition-shadow h-full flex flex-col">
                <CardHeader>
                    <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
                    <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3 mt-4`}>
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} text-white shadow`}>
                            <Icon className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription className="mt-1">{plan.description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    <div className={`flex items-baseline ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2 mb-3`}>
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">{plan.currency}</span>
                        <Badge variant="secondary" className="ml-auto">{plan.duration}</Badge>
                    </div>

                    <ul className="space-y-2 mb-4">
                        {plan.features?.map((f, idx) => (
                            <li key={idx} className={`flex items-start ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-2`}>
                                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                                <span className="text-sm">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-auto">
                        <Button
                            className="w-full bg-gradient-to-r from-primary via-primary to-primary/80 hover:via-primary/90"
                            onClick={() => handleBuy(plan.id)}
                            disabled={!plan.is_active || isCreating}
                        >
                            <Zap className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            {t('subscriptions.buyNow', 'Buy Plan')}
                        </Button>
                        {!plan.is_active && (
                            <p className="text-xs text-muted-foreground mt-2">{t('subscriptions.notAvailable', 'This plan is currently unavailable')}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" dir={direction}>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{t('subscriptions.title', 'Subscription Plans')}</h1>
                <p className="text-muted-foreground">{t('subscriptions.subtitle', 'Choose the plan that fits your journey')}</p>
            </div>

            {/* Active Subscription Banner */}
            {!isStatusLoading && status?.is_active && (
                <Card className="mb-8 border-green-200">
                    <CardContent className={`p-4 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <div className={`flex items-center ${direction === 'rtl' ? 'space-x-reverse' : ''} space-x-3 mb-2`}>
                            <BadgeCheck className="h-5 w-5 text-green-600" />
                            <div className="font-semibold">
                                {t('subscriptions.active', 'You have an active subscription')} — {status.plan?.toUpperCase()}
                            </div>
                            {status.has_verified_badge && (
                                <Badge variant="outline" className="ml-2">{t('subscriptions.verified', 'Verified badge')}</Badge>
                            )}
                        </div>
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground`}>
                            <div className="flex items-center">
                                <CalendarIcon className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                <span>{t('subscriptions.start', 'Start')}: {new Date(status.start_date || '').toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                                <CalendarIcon className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                <span>{t('subscriptions.end', 'End')}: {new Date(status.end_date || '').toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                                <TimerReset className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                <span>{t('subscriptions.remaining', 'Days remaining')}: {status.days_remaining ?? '-'}</span>
                            </div>
                        </div>

                        <div className={`mt-4 ${direction === 'rtl' ? 'text-left' : 'text-right'}`}>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isCancelling}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                                <XCircle className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                                {t('subscriptions.cancel', 'Cancel Subscription')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-72 rounded-lg border animate-pulse bg-muted/30" />
                    ))}
                </div>
            )}

            {isError && (
                <div className="text-center">
                    <p className="text-red-600 mb-2">{t('subscriptions.failed', 'Failed to load plans')}</p>
                    <Button variant="outline" onClick={() => refetch()}>{t('subscriptions.retry', 'Retry')}</Button>
                </div>
            )}

            {plans && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="relative">
                            {status?.is_active && (
                                <div className="absolute inset-0 z-10 rounded-lg bg-white/60 backdrop-blur-[1px] border pointer-events-none" />
                            )}
                            {renderPlan(plan)}
                            {status?.is_active && (
                                <div className="absolute top-3 right-3 z-20">
                                    <Badge variant="secondary">{t('subscriptions.alreadyActive', 'Active')}</Badge>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubscriptionPlans;


