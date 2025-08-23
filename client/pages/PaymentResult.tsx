import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useGetSubscriptionStatusQuery } from '@/store/subscriptionApi';

type PaymentStatus = 'success' | 'failure' | 'pending';

const PaymentResult = () => {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const [searchParams] = useSearchParams();
  
  // Get payment status from URL params
  const success = searchParams.get('success');
  const pending = searchParams.get('pending');
  
  // Determine payment status
  let paymentStatus: PaymentStatus = 'failure';
  if (success === 'true') {
    paymentStatus = 'success';
  } else if (pending === 'true') {
    paymentStatus = 'pending';
  }

  // Refetch subscription status if payment was successful
  const { refetch: refetchSubscriptionStatus } = useGetSubscriptionStatusQuery(undefined, {
    skip: paymentStatus !== 'success'
  });

  useEffect(() => {
    if (paymentStatus === 'success') {
      // Refetch subscription status to get updated data
      refetchSubscriptionStatus();
    }
  }, [paymentStatus, refetchSubscriptionStatus]);

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-500" />,
          title: 'تم الدفع بنجاح!',
          description: 'تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستمتاع بجميع الميزات المميزة.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-yellow-500" />,
          title: 'الدفع قيد المعالجة',
          description: 'عملية الدفع قيد المراجعة. سيتم تفعيل اشتراكك خلال دقائق قليلة.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'failure':
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'فشل في عملية الدفع',
          description: 'عذراً، لم تتم عملية الدفع بنجاح. يرجى المحاولة مرة أخرى.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const statusConfig = getStatusConfig(paymentStatus);

  const handleGoHome = () => {
    navigate('/feed');
  };

  const handleViewSubscription = () => {
    navigate('/subscription-status');
  };

  const handleTryAgain = () => {
    navigate('/subscription-plans');
  };

  const handleContactSupport = () => {
    // In a real app, this would open a support chat or email
    window.open('mailto:support@rahala.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12" dir={direction}>
      <div className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Card className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-2`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {statusConfig.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              <TranslatableText staticKey={`paymentResult.${paymentStatus}.title`}>
                {statusConfig.title}
              </TranslatableText>
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              <TranslatableText staticKey={`paymentResult.${paymentStatus}.description`}>
                {statusConfig.description}
              </TranslatableText>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Success Actions */}
            {paymentStatus === 'success' && (
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleViewSubscription}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  <TranslatableText staticKey="paymentResult.viewSubscription">
                    عرض تفاصيل الاشتراك
                  </TranslatableText>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  <TranslatableText staticKey="paymentResult.goHome">
                    العودة للرئيسية
                  </TranslatableText>
                </Button>
              </div>
            )}

            {/* Pending Actions */}
            {paymentStatus === 'pending' && (
              <div className="space-y-3">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <TranslatableText staticKey="paymentResult.pending.note">
                      سيتم إرسال إشعار عند تأكيد الدفع. يمكنك متابعة الحالة من صفحة الاشتراك.
                    </TranslatableText>
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full" 
                  onClick={handleViewSubscription}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  <TranslatableText staticKey="paymentResult.checkStatus">
                    متابعة حالة الدفع
                  </TranslatableText>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleGoHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  <TranslatableText staticKey="paymentResult.goHome">
                    العودة للرئيسية
                  </TranslatableText>
                </Button>
              </div>
            )}

            {/* Failure Actions */}
            {paymentStatus === 'failure' && (
              <div className="space-y-3">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <TranslatableText staticKey="paymentResult.failure.reasons">
                      أسباب محتملة: بيانات البطاقة غير صحيحة، رصيد غير كافي، أو مشكلة تقنية مؤقتة.
                    </TranslatableText>
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full" 
                  onClick={handleTryAgain}
                >
                  <TranslatableText staticKey="paymentResult.tryAgain">
                    المحاولة مرة أخرى
                  </TranslatableText>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContactSupport}
                >
                  <TranslatableText staticKey="paymentResult.contactSupport">
                    التواصل مع الدعم
                  </TranslatableText>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={handleGoHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  <TranslatableText staticKey="paymentResult.goHome">
                    العودة للرئيسية
                  </TranslatableText>
                </Button>
              </div>
            )}

            {/* Additional Information */}
            <div className="text-center pt-4 border-t">
              <p className="text-xs text-gray-500">
                <TranslatableText staticKey="paymentResult.transactionId">
                  رقم المعاملة: {searchParams.get('order_id') || 'N/A'}
                </TranslatableText>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <TranslatableText staticKey="paymentResult.timestamp">
                  التوقيت: {new Date().toLocaleString('ar-EG')}
                </TranslatableText>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            <TranslatableText staticKey="paymentResult.needHelp">
              تحتاج مساعدة؟
            </TranslatableText>
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="link"
              size="sm"
              onClick={handleContactSupport}
            >
              <TranslatableText staticKey="paymentResult.support">
                تواصل معنا
              </TranslatableText>
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/subscription-plans')}
            >
              <TranslatableText staticKey="paymentResult.viewPlans">
                عرض الخطط
              </TranslatableText>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;