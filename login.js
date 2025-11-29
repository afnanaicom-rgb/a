// استيراد الخدمات من ملف الإعدادات
import { auth, db } from "./firebase-config.js";

// استيراد دوال المصادقة
import { 
    sendSignInLinkToEmail, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    onAuthStateChanged,
    GoogleAuthProvider,
    GithubAuthProvider,
    MicrosoftAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    RecaptchaVerifier, // <-- إضافة لتسجيل الدخول بالهاتف
    signInWithPhoneNumber // <-- إضافة لتسجيل الدخول بالهاتف
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// استيراد دوال قاعدة البيانات
import { ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

// ضبط استمرارية تسجيل الدخول
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting persistence:", error);
});

// --- دوال التنقل بين الصفحات ---
// هذه الدوال تتحكم في إظهار وإخفاء الصفحات في login.html

function openPage(pageId) {
    document.querySelectorAll('.page, .full-page').forEach(page => {
        page.classList.remove('active');
        // معالجة الصفحات التي تستخدم display: none
        if (page.style.display === 'block') {
            page.style.display = 'none';
        }
    });
    
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.add('active');
        // معالجة الصفحات التي تستخدم display: none
        pageToShow.style.display = 'block';
    } else {
        console.error(`Page with id="${pageId}" not found.`);
    }
}

function closePage(pageId) {
    const pageToClose = document.getElementById(pageId);
    if (pageToClose) {
        pageToClose.classList.remove('active');
        // معالجة الصفحات التي تستخدم display: none
        pageToClose.style.display = 'none';
    }
    
    // إظهار صفحة تسجيل الدخول الرئيسية
    const loginPage = document.getElementById('loginPage');
    if (loginPage) {
        loginPage.classList.add('active');
        loginPage.style.display = 'block';
    }
}

// --- إعداد reCAPTCHA (لتسجيل الدخول بالهاتف) ---
// نحتاج لإعداد reCAPTCHA "غير مرئي" مرتبط بزر إرسال الهاتف
window.onload = () => {
    try {
        // نربط reCAPTCHA بزر إرسال الهاتف
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'phoneSubmit', {
            'size': 'invisible',
            'callback': (response) => {
                // reCAPTCHA تم حلها، يمكن المتابعة
                console.log("reCAPTCHA solved, proceeding with phone sign-in...");
            }
        });
        window.recaptchaVerifier.render().catch(err => {
             console.error("Recaptcha render error:", err);
             // قد تحتاج إلى إضافة عنصر div id="recaptcha-container" في login.html
             // إذا لم يعمل ربطه بالزر مباشرة
        });
        console.log("Recaptcha verifier initialized.");
    } catch (e) {
        console.error("Error initializing RecaptchaVerifier:", e);
    }
};


// --- إعدادات رابط البريد الإلكتروني ---
const actionCodeSettings = {
    url: window.location.origin + '/login.html', // استخدام الرابط الأساسي
    handleCodeInApp: true,
};

// 1. معالجة تسجيل الدخول بالبريد (id="emailSubmit")
document.getElementById('emailSubmit').addEventListener('click', async function() {
    const email = document.getElementById('emailInput').value;
    if (!email) {
        alert("الرجاء إدخال بريدك الإلكتروني.");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("الرجاء إدخال بريد إلكتروني صحيح.");
        return;
    }

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        openPage('emailVerificationPage');
        document.getElementById('verificationEmailDisplay').textContent = email;
    } catch (error) {
        console.error("Error sending sign-in link:", error);
        alert("حدث خطأ: " + error.message);
    }
});

// 2. معالجة تسجيل الدخول بجوجل (id="googleLogin")
document.getElementById('googleLogin').addEventListener('click', async function() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with Google:", result.user);
    } catch (error) {
        console.error("Error with Google Sign-In:", error);
        alert("حدث خطأ: " + error.message);
    }
});

// 3. معالجة تسجيل الدخول بجيت هب (id="githubLogin")
document.getElementById('githubLogin').addEventListener('click', async function() {
    const provider = new GithubAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with GitHub:", result.user);
    } catch (error) {
        console.error("Error with GitHub Sign-In:", error);
        alert("حدث خطأ: " + error.message);
    }
});

// 4. معالجة تسجيل الدخول بمايكروسوفت (id="microsoftLogin")
document.getElementById('microsoftLogin').addEventListener('click', async function() {
    const provider = new MicrosoftAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with Microsoft:", result.user);
    } catch (error) {
        console.error("Error with Microsoft Sign-In:", error);
        alert("حدث خطأ: " + error.message);
    }
});

// --- (جديد) كود تسجيل الدخول بالهاتف ---

// 5. إرسال رمز التحقق للهاتف (id="phoneSubmit")
document.getElementById('phoneSubmit').addEventListener('click', async function() {
    const phoneInput = document.getElementById('phoneInput').value;
    if (!phoneInput) {
        alert("الرجاء إدخال رقم الهاتف.");
        return;
    }
    // دمج كود الدولة (+20) مع الرقم المدخل
    const phoneNumber = '+20' + phoneInput;
    const appVerifier = window.recaptchaVerifier;

    try {
        console.log(`Sending code to ${phoneNumber}...`);
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        // حفظ نتيجة التأكيد لاستخدامها في الصفحة التالية
        window.confirmationResult = confirmationResult;
        console.log("Code sent. Opening verification page.");
        openPage('phoneVerificationPage');
    } catch (error) {
        console.error("Error sending phone verification code:", error);
        alert("حدث خطأ أثناء إرسال الرمز: " + error.message);
        // إعادة تعيين reCAPTCHA إذا فشل الإرسال
        window.recaptchaVerifier.render().catch(err => console.error("Recaptcha re-render error:", err));
    }
});

// 6. التحقق من الرمز المدخل (id="verifyPhone")
document.getElementById('verifyPhone').addEventListener('click', async function() {
    // *** تحذير: هذا الكود يجمع 4 أرقام فقط بناءً على HTML الخاص بك ***
    // *** Firebase يرسل 6 أرقام. يجب عليك تحديث HTML ***
    const inputs = document.querySelectorAll('#phoneVerificationPage .verification-input');
    let code = '';
    inputs.forEach(input => {
        code += input.value;
    });

    if (code.length < 4) { // يجب أن يكون 6 في الحقيقة
        alert("الرجاء إدخال الرمز كاملاً.");
        return;
    }

    if (!window.confirmationResult) {
        alert("حدث خطأ. الرجاء طلب الرمز مرة أخرى.");
        openPage('phoneLoginPage');
        return;
    }

    try {
        console.log(`Verifying code: ${code}`);
        const result = await window.confirmationResult.confirm(code);
        // تم تسجيل دخول المستخدم بنجاح
        console.log("Phone verification successful, user signed in:", result.user);
        // onAuthStateChanged سيتولى إعادة التوجيه
    } catch (error) {
        console.error("Error verifying code:", error);
        if (error.code === 'auth/invalid-verification-code') {
            alert("الرمز الذي أدخلته غير صحيح.");
        } else {
            alert("حدث خطأ: " + error.message);
        }
    }
});


// 7. التحقق من رابط تسجيل الدخول عند تحميل الصفحة
if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        email = window.prompt('الرجاء تأكيد بريدك الإلكتروني لإكمال عملية تسجيل الدخول.');
    }
    
    if (email) {
        try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            console.log("User signed in with email link");
        } catch (error) {
            console.error("Error signing in with email link:", error);
            alert("حدث خطأ: " + error.message);
        }
    }
}

// 8. مراقبة حالة المصادقة (لإعادة التوجيه)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is signed in:", user.uid);
        try {
            const userRef = ref(db, 'users/' + user.uid);
            const snapshot = await get(userRef);
            
            if (!snapshot.exists()) {
                console.log("New user, redirecting to id.html");
                setTimeout(() => { window.location.href = 'https://studio.afnanai.com/id.html'; }, 1000);
            } else {
                console.log("Existing user, redirecting to index.html");
                setTimeout(() => { window.location.href = 'https://studio.afnanai.com/index.html'; }, 1000);
            }
        } catch (error) {
            console.error("Error checking user data:", error);
            setTimeout(() => { window.location.href = 'https://studio.afnanai.com/id.html'; }, 1000);
        }
    } else {
        console.log("User is signed out");
        // التأكد من أن المستخدم على صفحة تسجيل الدخول
        if (window.location.pathname.includes('login.html')) {
            openPage('loginPage');
        } else if (!window.location.pathname.includes('login.html')) {
            // إذا كان في صفحة أخرى، أعده إلى login.html
            window.location.href = 'https://studio.afnanai.com/login.html';
        }
    }
});


// --- (هام جداً) إصلاح أزرار سياسة الخصوصية ---
// هذا الكود يجعل الدوال متاحة للاستدعاء من (onclick) في HTML
// هذا هو سبب عدم عمل روابط سياسة الخصوصية والشروط لديك
window.openPage = openPage;
window.closePage = closePage;
