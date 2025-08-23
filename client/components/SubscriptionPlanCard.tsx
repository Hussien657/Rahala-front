import { Crown, Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { SubscriptionPlan } from '@/store/subscriptionApi';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  isMostPopular?: boolean;
  onSelect: (planId: number) => void;
  isSelected?: boolean;
}

const SubscriptionPlanCard = ({
  plan,
  isCurrentPlan = false,
  isMostPopular = false,
  onSelect,
  isSelected = false
}: SubscriptionPlanCardProps) => {
  const { direction } = useLanguage();

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

  const handleSelect = () => {
    if (!isCurrentPlan) {
      onSelect(plan.id);
    }
  };

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-lg cursor-pointer ${
        isSelected ? 'ring-2 ring-primary' : ''
      } ${isCurrentPlan ? 'border-green-500 bg-green-50' : ''}`}
      onClick={handleSelect}
      dir={direction}
    >
      {/* Most Popular Badge */}
      {isMostPopular && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1">
            <TranslatableText staticKey="subscription.mostPopular">
              الأكثر شعبية
            </TranslatableText>
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
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
          variant={isCurrentPlan ? 'outline' : 'default'}
          disabled={isCurrentPlan}
          onClick={handleSelect}
        >
          {isCurrentPlan ? (
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
  );
};

export default SubscriptionPlanCard;