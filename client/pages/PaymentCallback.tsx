import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useSendPaymobWebhookMutation } from '@/store/subscriptionApi';
import { useLanguage } from '@/contexts/LanguageContext';

const useQueryParams = () => {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
};

const PaymentCallback = () => {
    const navigate = useNavigate();
    const params = useQueryParams();
    const { direction, t } = useLanguage();
    const [open, setOpen] = useState(true);
    const [sendWebhook, { isLoading, isSuccess, isError }] = useSendPaymobWebhookMutation();

    const success = params.get('success') === 'true' && params.get('error_occured') !== 'true';
    const hmac = params.get('hmac') || '';
    const orderId = Number(params.get('order')) || Number(localStorage.getItem('lastSubscriptionOrderId') || 0);
    const amountCents = Number(params.get('amount_cents') || 0);

    useEffect(() => {
        // Build payload from query params
        const payload: any = {};
        params.forEach((value, key) => {
            // Convert numeric fields when possible
            const numeric = Number(value);
            payload[key.replace(/\./g, '_')] = isNaN(numeric) ? value : numeric;
        });
        // Map required fields explicitly
        payload.id = payload.id || Number(params.get('id'));
        payload.success = success;
        payload.status = success ? 'success' : 'failed';
        payload.amount_cents = amountCents;
        payload.order = { id: orderId };

        if (hmac && orderId) {
            sendWebhook({ payload, hmac }).catch((e) => console.warn('Webhook failed', e));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const closeAndGo = () => {
        setOpen(false);
        // clear stored order id
        localStorage.removeItem('lastSubscriptionOrderId');
        navigate('/subscriptions');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" dir={direction}>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            {success ? (
                                <CheckCircle2 className={`h-5 w-5 text-green-600 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            ) : (
                                <AlertTriangle className={`h-5 w-5 text-red-600 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            )}
                            {success ? t('payments.successTitle', 'Payment Successful') : t('payments.failedTitle', 'Payment Failed')}
                        </DialogTitle>
                        <DialogDescription>
                            {success
                                ? t('payments.successDesc', 'Your subscription has been activated or will be activated shortly.')
                                : t('payments.failedDesc', 'Your payment could not be completed. If money was deducted, it will be reversed.')}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Details */}
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Order</span>
                            <Badge variant="secondary">{orderId || '-'}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-mono">{amountCents / 100} {params.get('currency') || 'EGP'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={success ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                {success ? 'Approved' : (params.get('data.message') || 'Declined')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Card</span>
                            <span className="font-mono">{params.get('source_data.sub_type') || ''} •••• {params.get('source_data.pan') || ''}</span>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <Button variant="outline" onClick={() => window.open(`/?${params.toString()}`, '_blank')}>
                            <ExternalLink className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                            {t('payments.viewRaw', 'View Raw Params')}
                        </Button>
                        <Button onClick={closeAndGo}>{t('payments.backToPlans', 'Back to Plans')}</Button>
                    </div>

                    {/* Status helper */}
                    <div className="mt-3 text-xs text-muted-foreground">
                        {isLoading && t('payments.syncing', 'Syncing payment status...')}
                        {isSuccess && t('payments.synced', 'Payment status synced.')}
                        {isError && t('payments.syncFailed', 'Failed to sync payment status.')}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PaymentCallback;


