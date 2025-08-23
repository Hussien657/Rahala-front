import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Calendar, 
  Clock, 
  CreditCard, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TranslatableText from '@/components/TranslatableText';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  useGetSubscriptionStatusQuery,
  useGetPaymentHistoryQuery,
  useCancelSubscriptionMutation
} from '@/store/subscriptionApi';
import { toast } from 'sonner';

const SubscriptionStatus = () => {
  const navigate = useNavigate();
  const { direction } = useLanguage();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { 
    data: subscriptionStatus, 
    isLoading: statusLoading, 
    error: statusError,
    refetch: refetchStatus
  } = useGetSubscriptionStatusQuery();

  const { 
    data: paymentHistory, 
    isLoading: historyLoading 
  } = useGetPaymentHistoryQuery();

  const [cancelSubscription, { isLoading: isCancelling }] = useCancelSubscriptionMutation();

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription().unwrap();
      toast.success('تم إلغاء الاشتراك بنجاح');
      setShowCancelDialog(false);
      refetchStatus();
    } catch (error: any) {
      console.error('Cancellation failed:', error);
      toast.error(error?.data?.detail || 'حدث خطأ في إلغاء الاشتراك');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'refunded':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">مكتمل</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">فاشل</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">ملغي</Badge>;
      case 'refunded':
        return <Badge className="bg-orange-100 text-orange-800">مسترد</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12" dir={direction}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
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

  if (statusError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={direction}>
        <Alert className="max-w-md">
          <AlertDescription>
            <TranslatableText staticKey="error.loadingStatus">
              حدث خطأ في تحميل حالة الاشتراك. يرجى المحاولة مرة أخرى.
            </TranslatableText>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12" dir={direction}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            <TranslatableText staticKey="subscriptionStatus.title">
              حالة الاشتراك
            </TranslatableText>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-3" />
                  <TranslatableText staticKey="subscriptionStatus.current">
                    الاشتراك الحالي
                  </TranslatableText>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionStatus?.is_active ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-primary">
                          {subscriptionStatus.plan.toUpperCase()}
                        </h3>
                        <p className="text-gray-600">
                          <TranslatableText staticKey="subscriptionStatus.activePlan">
                            خطة نشطة
                          </TranslatableText>
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <TranslatableText staticKey="subscriptionStatus.active">
                          نشط
                        </TranslatableText>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">
                            <TranslatableText staticKey="subscriptionStatus.startDate">
                              تاريخ البداية
                            </TranslatableText>
                          </p>
                          <p className="font-semibold">
                            {formatDate(subscriptionStatus.start_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">
                            <TranslatableText staticKey="subscriptionStatus.endDate">
                              تاريخ الانتهاء
                            </TranslatableText>
                          </p>
                          <p className="font-semibold">
                            {formatDate(subscriptionStatus.end_date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-blue-900 font-semibold">
                            <TranslatableText staticKey="subscriptionStatus.remaining">
                              متبقي {subscriptionStatus.days_remaining} يوم
                            </TranslatableText>
                          </p>
                          <p className="text-blue-700 text-sm">
                            <TranslatableText staticKey="subscriptionStatus.renewReminder">
              سيتم إنهاء الاشتراك تلقائياً في تاريخ الانتهاء
                            </TranslatableText>
                          </p>
                        </div>
                      </div>
                    </div>

                    {subscriptionStatus.has_verified_badge && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <Shield className="w-5 h-5 text-yellow-600 mr-2" />
                          <div>
                            <p className="text-yellow-900 font-semibold">
                              <TranslatableText staticKey="subscriptionStatus.verifiedBadge">
                                علامة التحقق نشطة
                              </TranslatableText>
                            </p>
                            <p className="text-yellow-700 text-sm">
                              <TranslatableText staticKey="subscriptionStatus.verifiedBadgeDesc">
                                يمكن للآخرين رؤية علامة التحقق في ملفك الشخصي
                              </TranslatableText>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      <TranslatableText staticKey="subscriptionStatus.noSubscription">
                        لا يوجد اشتراك نشط
                      </TranslatableText>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      <TranslatableText staticKey="subscriptionStatus.subscribeNow">
                        اشترك الآن للحصول على ميزات حصرية
                      </TranslatableText>
                    </p>
                    <Button onClick={() => navigate('/subscription-plans')}>
                      <TranslatableText staticKey="subscriptionStatus.browsePlans">
                        تصفح الخطط
                      </TranslatableText>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <TranslatableText staticKey="subscriptionStatus.paymentHistory">
                    تاريخ المدفوعات
                  </TranslatableText>
                </CardTitle>
                <CardDescription>
                  <TranslatableText staticKey="subscriptionStatus.paymentHistoryDesc">
                    جميع معاملات الاشتراك والدفع
                  </TranslatableText>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : paymentHistory && paymentHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <TranslatableText staticKey="subscriptionStatus.table.plan">
                            الخطة
                          </TranslatableText>
                        </TableHead>
                        <TableHead>
                          <TranslatableText staticKey="subscriptionStatus.table.amount">
                            المبلغ
                          </TranslatableText>
                        </TableHead>
                        <TableHead>
                          <TranslatableText staticKey="subscriptionStatus.table.status">
                            الحالة
                          </TranslatableText>
                        </TableHead>
                        <TableHead>
                          <TranslatableText staticKey="subscriptionStatus.table.date">
                            التاريخ
                          </TranslatableText>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{payment.subscription_plan.name}</p>
                              <p className="text-sm text-gray-500">
                                {payment.subscription_plan.plan_type} - {payment.subscription_plan.duration}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {payment.amount} {payment.subscription_plan.currency}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getStatusIcon(payment.status)}
                              <span className="ml-2">
                                {getStatusBadge(payment.status)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(payment.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      <TranslatableText staticKey="subscriptionStatus.noPaymentHistory">
                        لا يوجد تاريخ مدفوعات حتى الآن
                      </TranslatableText>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <TranslatableText staticKey="subscriptionStatus.quickActions">
                    إجراءات سريعة
                  </TranslatableText>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subscriptionStatus?.is_active ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/subscription-plans')}
                    >
                      <TranslatableText staticKey="subscriptionStatus.changePlan">
                        تغيير الخطة
                      </TranslatableText>
                    </Button>
                    <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <TranslatableText staticKey="subscriptionStatus.cancel">
                            إلغاء الاشتراك
                          </TranslatableText>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            <TranslatableText staticKey="subscriptionStatus.cancelDialog.title">
                              إلغاء الاشتراك
                            </TranslatableText>
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            <TranslatableText staticKey="subscriptionStatus.cancelDialog.description">
                              هل أنت متأكد من رغبتك في إلغاء الاشتراك؟ ستفقد جميع الميزات المميزة وعلامة التحقق فوراً.
                            </TranslatableText>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            <TranslatableText staticKey="common.cancel">
                              إلغاء
                            </TranslatableText>
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancelSubscription}
                            disabled={isCancelling}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isCancelling ? (
                              <TranslatableText staticKey="subscriptionStatus.cancelling">
                                جاري الإلغاء...
                              </TranslatableText>
                            ) : (
                              <TranslatableText staticKey="subscriptionStatus.confirmCancel">
                                نعم، إلغاء الاشتراك
                              </TranslatableText>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/subscription-plans')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    <TranslatableText staticKey="subscriptionStatus.subscribe">
                      اشترك الآن
                    </TranslatableText>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Benefits Reminder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <TranslatableText staticKey="subscriptionStatus.benefits.title">
                    فوائد الاشتراك
                  </TranslatableText>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm">
                    <TranslatableText staticKey="subscriptionStatus.benefits.verified">
                      علامة التحقق المميزة
                    </TranslatableText>
                  </span>
                </div>
                <div className="flex items-center">
                  <Crown className="w-4 h-4 text-yellow-500 mr-2" />
                  <span className="text-sm">
                    <TranslatableText staticKey="subscriptionStatus.benefits.priority">
                      دعم فني أولوية
                    </TranslatableText>
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="text-sm">
                    <TranslatableText staticKey="subscriptionStatus.benefits.features">
                      ميزات متقدمة حصرية
                    </TranslatableText>
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;