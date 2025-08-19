# نظام الترجمة المتكامل - Translation System

## نظرة عامة

تم تطوير نظام ترجمة متكامل يدعم الترجمة الثابتة والديناميكية باستخدام LibreTranslate API مع دعم كامل للغتين العربية والإنجليزية وتوجيه RTL/LTR.

## المكونات الرئيسية

### 1. خدمة الترجمة (`/client/lib/translation.ts`)

#### LibreTranslateService
- **API**: يستخدم LibreTranslate API (مفتوح المصدر)
- **Cache**: نظام تخزين مؤقت ذكي في localStorage
- **Fallback**: آلية احتياطية عند فشل الترجمة
- **Auto-detection**: كشف تلقائي للغة المصدر

```typescript
// استخدام الخدمة
import { translationService } from '@/lib/translation';

const translated = await translationService.translateText(
  'Hello World',
  'en',
  'ar'
);
```

#### الوظائف المساعدة
- `loadStaticTranslations()`: تحميل الترجمات الثابتة من JSON
- `getNestedTranslation()`: الوصول للترجمات المتداخلة
- `detectLanguage()`: كشف اللغة تلقائياً
- `containsArabic()` / `containsEnglish()`: فحص محتوى النص

### 2. سياق اللغة (`/client/contexts/LanguageContext.tsx`)

#### المميزات
- **إدارة الحالة**: حفظ اللغة المفضلة في localStorage
- **RTL/LTR**: تحديث اتجاه الصفحة تلقائياً
- **Static Translations**: تحميل الترجمات الثابتة من JSON
- **Dynamic Translation**: ترجمة النصوص الجديدة عند الطلب

```typescript
const { language, direction, t, translateText } = useLanguage();

// للترجمات الثابتة
const title = t('nav.feed', 'Feed');

// للترجمة الديناميكية
const translated = await translateText('مرحبا بك');
```

### 3. ملفات الترجمة الثابتة

#### `/public/locales/en/common.json`
```json
{
  "nav": {
    "feed": "Feed",
    "explore": "Explore"
  },
  "trip": {
    "translate": "Translate",
    "showOriginal": "Show Original"
  }
}
```

#### `/public/locales/ar/common.json`
```json
{
  "nav": {
    "feed": "الخلاصة",
    "explore": "استكشف"
  },
  "trip": {
    "translate": "ترجمة",
    "showOriginal": "عرض الأصل"
  }
}
```

## المكونات

### 1. TranslatableText
للنصوص الثابتة المحفوظة في ملفات JSON:

```tsx
<TranslatableText staticKey="nav.feed">Feed</TranslatableText>
```

### 2. TranslateButton
زر ترجمة للنصوص الديناميكية:

```tsx
<TranslateButton
  text="Hello World"
  onTranslatedTextChange={(translated, isTranslated) => {
    setDisplayText(translated);
  }}
  variant="outline"
  size="sm"
/>
```

### 3. DynamicTranslatedText
عرض نص مع زر ترجمة مدمج:

```tsx
<DynamicTranslatedText
  showTranslateButton={true}
  translateButtonProps={{ variant: "ghost", size: "sm" }}
>
  النص المراد ترجمته
</DynamicTranslatedText>
```

## الاستخدام

### للنصوص الثابتة (UI Elements)
```tsx
// في المكونات
<TranslatableText staticKey="settings.title">Settings</TranslatableText>

// في الكود
const { t } = useLanguage();
const placeholder = t('feed.searchPlaceholder', 'Search trips...');
```

### للنصوص الديناميكية (User Content)
```tsx
// في TripCard
<TranslateButton
  text={trip.title}
  onTranslatedTextChange={(text, isTranslated) => {
    setTranslatedTitle(text);
  }}
/>

// في CommentSection
<DynamicTranslatedText showTranslateButton={true}>
  {comment.content}
</DynamicTranslatedText>
```

## دعم RTL/LTR

### تلقائي
```tsx
const { direction } = useLanguage();

// يتم تطبيقه تلقائياً على:
document.documentElement.dir = direction; // 'rtl' أو 'ltr'
document.documentElement.lang = language; // 'ar' أو 'en'
```

### في المكونات
```tsx
<div className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
  <Icon className={`${direction === 'rtl' ? 'ml-2' : 'mr-2'}`} />
  <span>النص</span>
</div>
```

## التخزين المؤقت (Caching)

### للترجمات الديناميكية
- **localStorage**: حفظ آخر 100 ترجمة
- **Memory Cache**: تخزين مؤقت في الذاكرة أثناء الجلسة
- **Auto-cleanup**: تنظيف تلقائي لتجنب امتلاء التخزين

### للترجمات الثابتة
- **Memory Cache**: تحميل مرة واحدة عند تغيير اللغة
- **JSON Files**: ملفات منفصلة لكل لغة

## الأداء

### تحسينات
- **Lazy Loading**: تحميل الترجمات عند الحاجة
- **Debouncing**: تجنب الطلبات المتكررة
- **Cache First**: فحص التخزين المؤقت أولاً
- **Fallback**: عرض النص الأصلي عند فشل الترجمة

### مؤشرات التحميل
```tsx
const { isTranslating } = useLanguage();

{isTranslating && <LoadingSpinner />}
```

## إعداد LibreTranslate

### الخيارات
1. **Public Instance**: `https://libretranslate.com/translate`
2. **Self-hosted**: استضافة خاصة للمشاريع الكبيرة
3. **API Key**: اختياري للخدمات العامة، مطلوب للاستضافة الخاصة

### التكوين
```typescript
// في /client/lib/translation.ts
class LibreTranslateService {
  constructor() {
    this.baseUrl = 'https://libretranslate.com/translate';
    this.apiKey = process.env.VITE_LIBRETRANSLATE_API_KEY; // اختياري
  }
}
```

## الاختبار

### اختبار الترجمة
```bash
# تشغيل التطبيق
npm run dev

# اختبار تغيير اللغة
# اختبار ترجمة النصوص الديناميكية
# اختبار دعم RTL/LTR
```

### نصائح للاختبار
1. اختبر مع نصوص طويلة وقصيرة
2. اختبر مع نصوص مختلطة (عربي/إنجليزي)
3. اختبر الأداء مع التخزين المؤقت
4. اختبر حالات فشل الشبكة

## المشاكل الشائعة وحلولها

### 1. فشل تحميل الترجمات
```typescript
// التحقق من وجود الملفات
console.log('Loading translations for:', language);
```

### 2. مشاكل RTL
```css
/* في CSS */
[dir="rtl"] .custom-component {
  text-align: right;
}
```

### 3. بطء الترجمة
- تحقق من التخزين المؤقت
- استخدم API key للحصول على أولوية أعلى
- فكر في الاستضافة الخاصة

## التطوير المستقبلي

### مميزات مقترحة
- [ ] دعم لغات إضافية
- [ ] ترجمة الصور (OCR)
- [ ] ترجمة الصوت
- [ ] تحسين دقة الترجمة بالذكاء الاصطناعي
- [ ] إحصائيات الاستخدام
- [ ] واجهة إدارة الترجمات

### تحسينات الأداء
- [ ] Service Worker للتخزين المؤقت
- [ ] Compression للترجمات
- [ ] CDN للملفات الثابتة
- [ ] Background translation