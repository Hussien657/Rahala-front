import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Crown, CreditCard, Lock, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useGetSubscriptionPlansQuery, 
  useCreateSubscriptionMutation,
  type SubscriptionPlan 
} from '@/store/subscriptionApi';
import { toast } from 'sonner';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { direction } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get plan ID from navigation state
  const planId = location.state?.planId;
  
  const { data: plans, isLoading: plansLoading } = useGetSubscriptionPlansQuery();
  const [createSubscription] = useCreateSubscriptionMutation();
  
  const selectedPlan = plans?.find((plan) => plan.id === planId);

  useEffect(() => {
    // Redirect if no plan selected
    if (!planId) {
      navigate('/subscription-plans');
      toast.error('الرجاء اختيار خطة اشتراك أولاً');
    }
  }, [planId, navigate]);

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Creating subscription for plan:', selectedPlan.id);
      
      const result = await createSubscription({
        subscription_plan_id: selectedPlan.id
      }).unwrap();
      
      console.log('Subscription created successfully:', result);
      
      if (!result.iframe_url) {
        throw new Error('No iframe URL received from server');
      }
      
      toast.success('تم إنشاء طلب الدفع بنجاح');
      
      // Add a small delay to ensure toast is shown
      setTimeout(() => {
        console.log('Redirecting to PayMob iframe:', result.iframe_url);
        // Redirect to PayMob iframe
        window.location.href = result.iframe_url;
      }, 1000);
      
    } catch (error: any) {
      console.error('Payment creation failed:', error);
      
      let errorMessage = 'حدث خطأ في إنشاء طلب الدفع';
      
      if (error?.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error?.error?.data?.detail) {
        errorMessage = error.error.data.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
    }
  };

  const getIconForPlan = (planType: string) => {
    switch (planType) {
      case 'premium':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'pro':
        return <Shield className="w-6 h-6 text-purple-500" />;
      default:
        return <CreditCard className="w-6 h-6 text-blue-500" />;
    }
  };

  if (!planId) {
    return null; // Will redirect
  }

  if (plansLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" dir={direction}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <Alert className="max-w-md">
          <AlertDescription>
            <TranslatableText staticKey="error.planNotFound">
              لم يتم العثور على الخطة المحددة. يرجى العودة واختيار خطة صحيحة.
            </TranslatableText>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={direction}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/subscription-plans')}
            className="mb-4"
          >
            <ArrowLeft className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            <TranslatableText staticKey="checkout.back">
              العودة للخطط
            </TranslatableText>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            <TranslatableText staticKey="checkout.title">
              إتمام الدفع
            </TranslatableText>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {getIconForPlan(selectedPlan.plan_type)}
                <span className={`${direction === 'rtl' ? 'mr-3' : 'ml-3'}`}>
                  <TranslatableText staticKey="checkout.orderSummary">
                    ملخص الطلب
                  </TranslatableText>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{selectedPlan.name}</h3>
                  <p className="text-sm text-gray-600">{selectedPlan.description}</p>
                  <Badge variant="secondary" className="mt-2">
                    <TranslatableText staticKey={`subscription.${selectedPlan.duration}`}>
                      {selectedPlan.duration === 'monthly' ? 'شهرياً' : 'سنوياً'}
                    </TranslatableText>
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {selectedPlan.price} {selectedPlan.currency}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">
                  <TranslatableText staticKey="checkout.features">
                    الميزات المشمولة:
                  </TranslatableText>
                </h4>
                <div className="space-y-2">
                  {selectedPlan.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <TranslatableText staticKey="checkout.total">
                    المجموع الكلي:
                  </TranslatableText>
                  <span>{selectedPlan.price} {selectedPlan.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-3" />
                <TranslatableText staticKey="checkout.paymentMethod">
                  طريقة الدفع
                </TranslatableText>
              </CardTitle>
              <CardDescription>
                <TranslatableText staticKey="checkout.paymentDescription">
                  الدفع الآمن عبر PayMob
                </TranslatableText>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* PayMob Payment Option */}
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">PayMob</h4>
                      <p className="text-sm text-blue-700">
                        <TranslatableText staticKey="checkout.paymob.description">
                          فيزا، ماستركارد، محافظ إلكترونية
                        </TranslatableText>
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <TranslatableText staticKey="checkout.recommended">
                      موصى به
                    </TranslatableText>
                  </Badge>
                </div>
              </div>

              {/* Security Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Lock className="w-4 h-4 text-gray-600 mr-2" />
                  <span className="text-sm font-semibold text-gray-800">
                    <TranslatableText staticKey="checkout.security.title">
                      الأمان والحماية
                    </TranslatableText>
                  </span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <TranslatableText staticKey="checkout.security.ssl">تشفير SSL 256-bit</TranslatableText></li>
                  <li>• <TranslatableText staticKey="checkout.security.pci">معتمد PCI DSS</TranslatableText></li>
                  <li>• <TranslatableText staticKey="checkout.security.data">لا نحتفظ ببيانات البطاقة</TranslatableText></li>
                </ul>
              </div>

              {/* Payment Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <TranslatableText staticKey="checkout.processing">
                      جاري المعالجة...
                    </TranslatableText>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    <span>
                      <TranslatableText staticKey="checkout.payNow">
                        ادفع الآن
                      </TranslatableText>
                      {` ${selectedPlan.price} ${selectedPlan.currency}`}
                    </span>
                  </div>
                )}
              </Button>

              {/* Payment Steps */}
              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-semibold">
                  <TranslatableText staticKey="checkout.steps.title">
                    خطوات الدفع:
                  </TranslatableText>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li><TranslatableText staticKey="checkout.steps.redirect">سيتم تحويلك لصفحة PayMob الآمنة</TranslatableText></li>
                  <li><TranslatableText staticKey="checkout.steps.enter">أدخل بيانات البطاقة أو المحفظة</TranslatableText></li>
                  <li><TranslatableText staticKey="checkout.steps.complete">أكمل عملية الدفع</TranslatableText></li>
                  <li><TranslatableText staticKey="checkout.steps.activate">سيتم تفعيل اشتراكك فوراً</TranslatableText></li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;