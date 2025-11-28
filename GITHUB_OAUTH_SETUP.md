# تفعيل تسجيل الدخول بـ GitHub في Firebase

## المشكلة
عند الضغط على زر "Continue with GitHub"، تفتح نافذة المصادقة ثم تغلق فوراً دون إتمام عملية تسجيل الدخول.

## السبب
لم يتم تفعيل GitHub OAuth بشكل كامل في Firebase، أو لم يتم إنشاء GitHub OAuth App وربطها بـ Firebase.

## الحل: خطوات تفعيل GitHub OAuth

### الجزء الأول: إنشاء GitHub OAuth App

#### 1. الذهاب إلى GitHub Settings
- افتح [GitHub Developer Settings](https://github.com/settings/developers)
- أو اذهب إلى: **Settings** → **Developer settings** → **OAuth Apps**

#### 2. إنشاء OAuth App جديد
- اضغط على **New OAuth App**
- املأ البيانات التالية:

```
Application name: Afnan AI
Homepage URL: https://studio.afnanai.com/
Authorization callback URL: https://afnanai-640b4.firebaseapp.com/__/auth/handler
```

#### 3. الحصول على Client ID و Client Secret
- بعد إنشاء التطبيق، ستحصل على **Client ID**
- اضغط على **Generate a new client secret** للحصول على **Client Secret**
- **مهم جداً**: احفظ الـ Client Secret في مكان آمن لأنه لن يظهر مرة أخرى

---

### الجزء الثاني: تفعيل GitHub في Firebase Console

#### 1. الذهاب إلى Firebase Console
- افتح [Firebase Console](https://console.firebase.google.com/)
- اختر مشروعك: **afnanai-640b4**

#### 2. تفعيل GitHub Authentication
- من القائمة الجانبية، اختر **Build** → **Authentication**
- اضغط على تبويب **Sign-in method**
- ابحث عن **GitHub** في قائمة مقدمي الخدمة (Providers)
- اضغط على **GitHub**

#### 3. إدخال بيانات GitHub OAuth App
- فعّل الخيار **Enable** (تفعيل)
- الصق **Client ID** من GitHub
- الصق **Client Secret** من GitHub
- اضغط على **Save** (حفظ)

#### 4. نسخ Authorization callback URL
- بعد الحفظ، ستجد **Authorization callback URL** في صفحة إعدادات GitHub في Firebase
- انسخ هذا الرابط (يجب أن يكون مشابهاً لـ: `https://afnanai-640b4.firebaseapp.com/__/auth/handler`)

#### 5. التحقق من GitHub OAuth App
- ارجع إلى [GitHub OAuth Apps](https://github.com/settings/developers)
- افتح التطبيق الذي أنشأته
- تأكد أن **Authorization callback URL** مطابق للرابط من Firebase

---

## التحقق من التفعيل

بعد إتمام الخطوات السابقة:

1. افتح موقعك: https://studio.afnanai.com/login.html
2. اضغط على زر **Continue with GitHub**
3. يجب أن تفتح نافذة GitHub OAuth وتطلب منك الموافقة
4. بعد الموافقة، سيتم تسجيل دخولك بنجاح

---

## ملاحظات مهمة

1. **Domain Verification**: تأكد أن النطاق `studio.afnanai.com` مضاف في قائمة **Authorized domains** في Firebase Authentication
2. **HTTPS Required**: تسجيل الدخول بـ OAuth يتطلب HTTPS (GitHub Pages يوفر HTTPS تلقائياً)
3. **Client Secret**: لا تشارك الـ Client Secret مع أحد ولا تضعه في الكود المصدري

---

## استكشاف الأخطاء

إذا استمرت المشكلة:

1. **تحقق من Console في المتصفح**: افتح Developer Tools (F12) وانظر إلى رسائل الخطأ
2. **تحقق من Authorized domains**: في Firebase Console → Authentication → Settings → Authorized domains
3. **تحقق من GitHub OAuth App**: تأكد أن الـ Callback URL صحيح تماماً
4. **امسح الـ Cache**: امسح cache المتصفح وحاول مرة أخرى
