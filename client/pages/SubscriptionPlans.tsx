import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Star, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGetSubscriptionPlansQuery, useGetSubscriptionStatusQuery } from '@/store/subscriptionApi';
import { toast } from 'sonner';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  const { 
    data: plans, 
    isLoading: plansLoading, 
    error: plansError 
  } = useGetSubscriptionPlansQuery();

  const { 
    data: subscriptionStatus, 
    isLoading: statusLoading 
  } = useGetSubscriptionStatusQuery();

  const handleSelectPlan = (planId: number) => {
    setSelectedPlan(planId);
    // Navigate to checkout with selected plan
    navigate('/checkout', { state: { planId } });
  };

  const getIconForPlan = (planType: string) => {
    switch (planType) {
      case 'premium':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'pro':
        return <Zap className="w-6 h-6 text-purple-500" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBadgeVariant = (planType: string) => {
    switch (planType) {
      case 'premium':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isCurrentPlan = (planType: string) => {
    return subscriptionStatus?.plan === planType && subscriptionStatus?.is_active;
  };

  if (plansLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" dir={direction}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="relative">
                <CardHeader>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-4 w-full" />
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <Alert className="max-w-md">
          <AlertDescription>
            <TranslatableText staticKey="error.loadingPlans">
              حدث خطأ في تحميل خطط الاشتراك. يرجى المحاولة مرة أخرى.
            </TranslatableText>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={direction}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Authentication Required Alert */}
        {!isAuthenticated && (
          <div className="mb-8">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-2">تسجيل الدخول مطلوب</h3>
                    <p>يجب عليك تسجيل الدخول أولاً للوصول لخطط الاشتراك</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    تسجيل الدخول
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <TranslatableText staticKey="subscription.title">
              خطط الاشتراك
            </TranslatableText>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            <TranslatableText staticKey="subscription.subtitle">
              اختر الخطة المناسبة لك واحصل على ميزات حصرية ومميزة
            </TranslatableText>
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscriptionStatus && subscriptionStatus.is_active && (
          <div className="mb-12">
            <Alert className="border-green-200 bg-green-50">
              <Shield className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span>
                      <TranslatableText staticKey="subscription.currentStatus">
                        اشتراكك الحالي:
                      </TranslatableText>
                      {` ${subscriptionStatus.plan.toUpperCase()}`}
                    </span>
                    <span className="block text-sm mt-1">
                      <span>
                        <TranslatableText staticKey="subscription.daysRemaining">
                          متبقي
                        </TranslatableText>
                        {` ${subscriptionStatus.days_remaining} يوم`}
                      </span>
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/subscription-status')}
                  >
                    <TranslatableText staticKey="subscription.manage">
                      إدارة الاشتراك
                    </TranslatableText>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans?.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all duration-300 hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
              } ${isCurrentPlan(plan.plan_type) ? 'border-green-500 bg-green-50' : ''}`}
            >
              {/* Most Popular Badge */}
              {plan.plan_type === 'premium' && plan.duration === 'yearly' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1">
                    <TranslatableText staticKey="subscription.mostPopular">
                      الأكثر شعبية
                    </TranslatableText>
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan(plan.plan_type) && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    <TranslatableText staticKey="subscription.currentPlan">
                      الخطة الحالية
                    </TranslatableText>
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {getIconForPlan(plan.plan_type)}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold text-primary">
                    {plan.price} {plan.currency}
                  </div>
                  <div className="text-sm text-gray-500">
                    <TranslatableText staticKey={`subscription.${plan.duration}`}>
                      {plan.duration === 'monthly' ? 'شهرياً' : 'سنوياً'}
                    </TranslatableText>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan(plan.plan_type) ? 'outline' : 'default'}
                  disabled={isCurrentPlan(plan.plan_type)}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrentPlan(plan.plan_type) ? (
                    <TranslatableText staticKey="subscription.current">
                      الخطة الحالية
                    </TranslatableText>
                  ) : (
                    <TranslatableText staticKey="subscription.subscribe">
                      اشترك الآن
                    </TranslatableText>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            <TranslatableText staticKey="subscription.benefits.title">
              لماذا الاشتراك؟
            </TranslatableText>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatableText staticKey="subscription.benefits.verified">
                  علامة التحقق
                </TranslatableText>
              </h3>
              <p className="text-gray-600">
                <TranslatableText staticKey="subscription.benefits.verifiedDesc">
                  احصل على علامة التحقق المميزة لإظهار مصداقيتك
                </TranslatableText>
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatableText staticKey="subscription.benefits.priority">
                  دعم أولوية
                </TranslatableText>
              </h3>
              <p className="text-gray-600">
                <TranslatableText staticKey="subscription.benefits.priorityDesc">
                  احصل على دعم فني سريع ومباشر
                </TranslatableText>
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                <TranslatableText staticKey="subscription.benefits.features">
                  ميزات حصرية
                </TranslatableText>
              </h3>
              <p className="text-gray-600">
                <TranslatableText staticKey="subscription.benefits.featuresDesc">
                  استمتع بميزات متقدمة غير متاحة للمستخدمين العاديين
                </TranslatableText>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;