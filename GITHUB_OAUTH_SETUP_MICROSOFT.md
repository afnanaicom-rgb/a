# تفعيل تسجيل الدخول بـ Microsoft في Firebase

## الهدف
إضافة Microsoft كطريقة تسجيل دخول جديدة للمستخدمين.

## الحل: خطوات تفعيل Microsoft OAuth

### الجزء الأول: إنشاء تطبيق Microsoft Azure/Active Directory

#### 1. الذهاب إلى Azure App Registrations
- افتح [Azure App Registrations](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
- اضغط على **New registration**

#### 2. تسجيل تطبيق جديد
- **Name**: Afnan AI
- **Supported account types**: اختر الخيار المناسب (عادةً "Accounts in any organizational directory (Any Azure AD directory - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)")
- **Redirect URI**:
    - **Platform**: Web
    - **URL**: `https://afnanai-640b4.firebaseapp.com/__/auth/handler` (هذا هو نفس الـ Callback URL الخاص بـ Firebase)
- اضغط على **Register**

#### 3. الحصول على Application (client) ID و Client Secret
- بعد التسجيل، ستجد **Application (client) ID** (هذا هو Client ID)
- اذهب إلى **Certificates & secrets**
- اضغط على **New client secret**
- أضف وصفاً (مثل Firebase Auth) واختر مدة الصلاحية
- اضغط على **Add**
- **مهم جداً**: انسخ **Value** الخاص بالـ Client Secret فوراً، لأنه لن يظهر مرة أخرى.

---

### الجزء الثاني: تفعيل Microsoft في Firebase Console

#### 1. الذهاب إلى Firebase Console
- افتح [Firebase Console](https://console.firebase.google.com/)
- اختر مشروعك: **afnanai-640b4**

#### 2. تفعيل Microsoft Authentication
- من القائمة الجانبية، اختر **Build** → **Authentication**
- اضغط على تبويب **Sign-in method**
- ابحث عن **Microsoft** في قائمة مقدمي الخدمة (Providers)
- اضغط على **Microsoft**

#### 3. إدخال بيانات Microsoft OAuth App
- فعّل الخيار **Enable** (تفعيل)
- الصق **Application (client) ID** من Azure
- الصق **Client Secret** (القيمة التي نسختها من Certificates & secrets)
- اضغط على **Save** (حفظ)

#### 4. التحقق من Authorized Domains
- في نفس صفحة **Authentication** → **Settings** → **Authorized domains**
- تأكد أن النطاق `studio.afnanai.com` موجود في القائمة.

---

## تحديث ملف login.js

لتفعيل الزر في الكود، يجب تعديل ملف `login.js` لإضافة معالج تسجيل الدخول بـ Microsoft.

### التعديلات المطلوبة في `a/login.js`

1.  **استيراد MicrosoftAuthProvider**:
    ```javascript
    import { 
        // ... (باقي الاستيرادات)
        GithubAuthProvider,
        MicrosoftAuthProvider, // إضافة هذا السطر
        signInWithPopup,
        // ...
    } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
    ```

2.  **إضافة معالج زر Microsoft**:
    ```javascript
    // 4. Handle Microsoft Sign-In (سيصبح رقم 4 بعد إضافة GitHub)
    document.getElementById('microsoftLogin').addEventListener('click', async function() {
        const provider = new MicrosoftAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("User signed in with Microsoft:", result.user);
            // User is signed in, onAuthStateChanged will handle redirection
        } catch (error) {
            console.error("Error with Microsoft Sign-In:", error);
            
            // Handle specific Firebase errors
            if (error.code === 'auth/popup-blocked') {
                alert("تم حظر النافذة المنبثقة. الرجاء السماح بالنوافذ المنبثقة.");
            } else if (error.code === 'auth/popup-closed-by-user') {
                console.log("User closed the popup");
            } else {
                alert("حدث خطأ: " + error.message);
            }
        }
    });
    ```

---

## تحديث ملف login.html

يجب إضافة زر لـ Microsoft في ملف `a/login.html`.

### التعديلات المطلوبة في `a/login.html`

ابحث عن قسم أزرار تسجيل الدخول وأضف الزر الجديد:

```html
<!-- ... (أزرار تسجيل الدخول الأخرى) ... -->
<button id="microsoftLogin" class="social-login-btn microsoft-btn">
    <img src="microsoft-logo.png" alt="Microsoft Logo">
    <span>Continue with Microsoft</span>
</button>
<!-- ... -->
```

**ملاحظة**: ستحتاج إلى إضافة ملف `microsoft-logo.png` وتحديث ملف `login.css` لتنسيق الزر.
