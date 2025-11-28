# تعليمات الإعداد الكاملة - Afnan AI

## ملخص التحديثات

تم إجراء التحديثات التالية على المشروع:

### ✅ التحديثات المكتملة (في الكود)
1. ✅ إضافة زر تسجيل الدخول بـ GitHub تحت زر Google
2. ✅ إصلاح مشكلة زر Google (إزالة `prompt: 'consent'` التي كانت تسبب مشاكل)
3. ✅ تحسين نظام الـ onboarding باستخدام Firebase Database بدلاً من localStorage
4. ✅ إضافة معالجة أفضل للأخطاء في تسجيل الدخول

### ⚠️ الإعدادات المطلوبة (يجب تطبيقها في Firebase Console)
يجب عليك تطبيق الإعدادات التالية في Firebase Console لكي يعمل الموقع بشكل صحيح:

---

## 🔴 خطوة 1: تحديث قواعد Firebase Database (مطلوب جداً)

### المشكلة الحالية
خطأ `PERMISSION_DENIED` يظهر عند محاولة حفظ بيانات المستخدم.

### الحل

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **afnanai-640b4**
3. من القائمة الجانبية: **Build** → **Realtime Database**
4. اضغط على تبويب **Rules**
5. استبدل القواعد الحالية بالتالي:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

6. اضغط على **Publish** لحفظ القواعد

**ملاحظة**: بدون هذه الخطوة، لن يتمكن المستخدمون من إكمال صفحات الـ onboarding!

---

## 🔴 خطوة 2: تفعيل GitHub OAuth (مطلوب لتسجيل الدخول بـ GitHub)

### الجزء الأول: إنشاء GitHub OAuth App

1. افتح [GitHub Developer Settings](https://github.com/settings/developers)
2. اضغط على **OAuth Apps** → **New OAuth App**
3. املأ البيانات:
   - **Application name**: `Afnan AI`
   - **Homepage URL**: `https://studio.afnanai.com/`
   - **Authorization callback URL**: `https://afnanai-640b4.firebaseapp.com/__/auth/handler`
4. اضغط على **Register application**
5. احفظ **Client ID**
6. اضغط على **Generate a new client secret** واحفظ **Client Secret**

### الجزء الثاني: تفعيل GitHub في Firebase

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: **afnanai-640b4**
3. من القائمة الجانبية: **Build** → **Authentication**
4. اضغط على تبويب **Sign-in method**
5. ابحث عن **GitHub** واضغط عليه
6. فعّل الخيار **Enable**
7. الصق **Client ID** و **Client Secret** من GitHub
8. اضغط على **Save**

### التحقق من Authorized Domains

1. في نفس صفحة **Authentication** → **Settings** → **Authorized domains**
2. تأكد أن النطاق التالي موجود في القائمة:
   - `studio.afnanai.com`
3. إذا لم يكن موجوداً، اضغط على **Add domain** وأضفه

---

## 📋 كيف يعمل النظام الجديد

### للمستخدمين الجدد:
1. يسجل الدخول عبر Email / Google / GitHub
2. يتم التحقق من Firebase Database
3. إذا لم توجد بيانات → يذهب لصفحات الـ onboarding:
   - صفحة ID
   - صفحة الاسم والعمر
   - صفحة الترحيب
4. عند الضغط على "Get Started" في صفحة الترحيب:
   - يتم حفظ البيانات في Firebase Database
   - يتم التوجيه إلى index.html

### للمستخدمين القدامى:
1. يسجل الدخول
2. يتم التحقق من Firebase Database
3. إذا وجدت بيانات → يذهب مباشرة إلى index.html
4. **لن تظهر صفحات الـ onboarding مرة أخرى**

---

## 🧪 اختبار النظام

### اختبار المستخدم الجديد:
1. افتح المتصفح في وضع Incognito/Private
2. اذهب إلى: https://studio.afnanai.com/login.html
3. سجل دخول بحساب جديد
4. يجب أن تظهر صفحات الـ onboarding
5. أكمل البيانات واضغط "Get Started"
6. يجب أن تذهب إلى index.html

### اختبار المستخدم القديم:
1. سجل خروج من الحساب
2. سجل دخول مرة أخرى بنفس الحساب
3. يجب أن تذهب مباشرة إلى index.html **بدون** صفحات الـ onboarding

---

## 🐛 استكشاف الأخطاء

### إذا ظهر خطأ PERMISSION_DENIED:
- تأكد من تطبيق **خطوة 1** (قواعد Firebase Database)
- تأكد أن القواعد تم نشرها (Publish)

### إذا لم يعمل تسجيل الدخول بـ GitHub:
- تأكد من تطبيق **خطوة 2** (GitHub OAuth)
- تأكد من صحة Callback URL في GitHub OAuth App
- تأكد من إضافة النطاق في Authorized domains

### إذا ظهرت صفحات الـ onboarding للمستخدمين القدامى:
- افتح Developer Tools (F12) → Console
- ابحث عن رسائل الخطأ
- تأكد من وجود بيانات المستخدم في Firebase Database

---

## 📁 الملفات المعدلة

- `login.html` - إضافة زر GitHub
- `login.js` - إضافة GitHub OAuth + تحسين معالجة الأخطاء + التحقق من Database
- `auth-guard.js` - التحقق من Firebase Database بدلاً من localStorage
- `welcome.html` - حفظ البيانات في Firebase Database
- `FIREBASE_DATABASE_RULES.md` - توثيق قواعد Database
- `GITHUB_OAUTH_SETUP.md` - توثيق تفعيل GitHub OAuth

---

## ✅ قائمة المراجعة

قبل أن تعتبر الإعداد مكتملاً، تأكد من:

- [ ] تحديث قواعد Firebase Realtime Database
- [ ] إنشاء GitHub OAuth App
- [ ] تفعيل GitHub في Firebase Authentication
- [ ] التحقق من Authorized domains في Firebase
- [ ] اختبار تسجيل الدخول بـ Google
- [ ] اختبار تسجيل الدخول بـ GitHub
- [ ] اختبار تسجيل الدخول بـ Email
- [ ] اختبار صفحات الـ onboarding للمستخدم الجديد
- [ ] اختبار عدم ظهور الـ onboarding للمستخدم القديم

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. افتح Developer Tools (F12) → Console
2. ابحث عن رسائل الخطأ
3. راجع الملفات التوثيقية:
   - `FIREBASE_DATABASE_RULES.md`
   - `GITHUB_OAUTH_SETUP.md`
