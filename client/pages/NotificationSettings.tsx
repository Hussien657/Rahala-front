import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Bell, Heart, MessageCircle, UserPlus, Share2, Mail, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import TranslatableText from '@/components/TranslatableText';
import { 
    useGetNotificationSettingsQuery, 
    useUpdateNotificationSettingsMutation,
    type NotificationSettings 
} from '@/store/interactionsApi';

const NotificationSettingsPage: React.FC = () => {
    const { direction } = useLanguage();
    const { data: settings, isLoading, error } = useGetNotificationSettingsQuery();
    const [updateSettings, { isLoading: isUpdating }] = useUpdateNotificationSettingsMutation();
    
    const [localSettings, setLocalSettings] = useState<NotificationSettings>({
        likes_enabled: true,
        comments_enabled: true,
        follows_enabled: true,
        shares_enabled: true,
        email_notifications: false,
        push_notifications: true,
    });

    // Update local settings when data is loaded
    React.useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        try {
            await updateSettings(localSettings).unwrap();
            toast({
                title: "تم الحفظ",
                description: "تم حفظ إعدادات الإشعارات بنجاح",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "خطأ",
                description: "حدث خطأ أثناء حفظ الإعدادات",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-red-500">حدث خطأ أثناء تحميل الإعدادات</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className={`flex items-center gap-4 mb-6 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
                    <Link to="/notifications">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">
                            <TranslatableText staticKey="notifications.settings.title">
                                إعدادات الإشعارات
                            </TranslatableText>
                        </h1>
                        <p className="text-muted-foreground">
                            <TranslatableText staticKey="notifications.settings.description">
                                تحكم في أنواع الإشعارات التي تريد استقبالها
                            </TranslatableText>
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5" />
                            <TranslatableText staticKey="notifications.settings.activityTitle">
                                إشعارات النشاط
                            </TranslatableText>
                        </CardTitle>
                        <CardDescription>
                            <TranslatableText staticKey="notifications.settings.activityDescription">
                                اختر أنواع النشاط التي تريد الحصول على إشعارات بشأنها
                            </TranslatableText>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Likes */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Heart className="h-5 w-5 text-red-500" />
                                <div>
                                    <Label htmlFor="likes">
                                        <TranslatableText staticKey="notifications.settings.likes">
                                            الإعجابات
                                        </TranslatableText>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        <TranslatableText staticKey="notifications.settings.likesDesc">
                                            عندما يعجب أحد برحلتك
                                        </TranslatableText>
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="likes"
                                checked={localSettings.likes_enabled}
                                onCheckedChange={(checked) => handleSettingChange('likes_enabled', checked)}
                            />
                        </div>

                        <Separator />

                        {/* Comments */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="h-5 w-5 text-blue-500" />
                                <div>
                                    <Label htmlFor="comments">
                                        <TranslatableText staticKey="notifications.settings.comments">
                                            التعليقات
                                        </TranslatableText>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        <TranslatableText staticKey="notifications.settings.commentsDesc">
                                            عندما يعلق أحد على رحلتك
                                        </TranslatableText>
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="comments"
                                checked={localSettings.comments_enabled}
                                onCheckedChange={(checked) => handleSettingChange('comments_enabled', checked)}
                            />
                        </div>

                        <Separator />

                        {/* Follows */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <UserPlus className="h-5 w-5 text-green-500" />
                                <div>
                                    <Label htmlFor="follows">
                                        <TranslatableText staticKey="notifications.settings.follows">
                                            المتابعات
                                        </TranslatableText>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        <TranslatableText staticKey="notifications.settings.followsDesc">
                                            عندما يتابعك أحد
                                        </TranslatableText>
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="follows"
                                checked={localSettings.follows_enabled}
                                onCheckedChange={(checked) => handleSettingChange('follows_enabled', checked)}
                            />
                        </div>

                        <Separator />

                        {/* Shares */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Share2 className="h-5 w-5 text-purple-500" />
                                <div>
                                    <Label htmlFor="shares">
                                        <TranslatableText staticKey="notifications.settings.shares">
                                            المشاركات
                                        </TranslatableText>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        <TranslatableText staticKey="notifications.settings.sharesDesc">
                                            عندما يشارك أحد رحلتك
                                        </TranslatableText>
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="shares"
                                checked={localSettings.shares_enabled}
                                onCheckedChange={(checked) => handleSettingChange('shares_enabled', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Methods */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>
                            <TranslatableText staticKey="notifications.settings.deliveryTitle">
                                طرق التوصيل
                            </TranslatableText>
                        </CardTitle>
                        <CardDescription>
                            <TranslatableText staticKey="notifications.settings.deliveryDescription">
                                اختر كيف تريد استقبال الإشعارات
                            </TranslatableText>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Push Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-5 w-5 text-blue-500" />
                                <div>
                                    <Label htmlFor="push">
                                        <TranslatableText staticKey="notifications.settings.push">
                                            إشعارات فورية
                                        </TranslatableText>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        <TranslatableText staticKey="notifications.settings.pushDesc">
                                            إشعارات في الوقت الفعلي على الموقع
                                        </TranslatableText>
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="push"
                                checked={localSettings.push_notifications}
                                onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                            />
                        </div>

                        <Separator />

                        {/* Email Notifications */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-orange-500" />
                                <div>
                                    <Label htmlFor="email">
                                        <TranslatableText staticKey="notifications.settings.email">
                                            إشعارات البريد الإلكتروني
                                        </TranslatableText>
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        <TranslatableText staticKey="notifications.settings.emailDesc">
                                            إرسال ملخص يومي بالإشعارات
                                        </TranslatableText>
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="email"
                                checked={localSettings.email_notifications}
                                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleSave} disabled={isUpdating}>
                        {isUpdating ? (
                            <TranslatableText staticKey="common.saving">جاري الحفظ...</TranslatableText>
                        ) : (
                            <TranslatableText staticKey="common.save">حفظ التغييرات</TranslatableText>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsPage;
