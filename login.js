// login.js

import { auth, db } from "./firebase-config.js";
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
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

// Set persistence to LOCAL so the user stays logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Error setting persistence:", error);
});

// --- Page Navigation Functions ---

function openPage(pageId) {
    document.querySelectorAll('.page, .full-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function closePage(pageId) {
    document.getElementById(pageId).classList.remove('active');
    document.getElementById('loginPage').classList.add('active');
}

// --- Firebase Auth Functions ---

const actionCodeSettings = {
    // URL to redirect to after email link is sent.
    url: 'https://studio.afnanai.com/login.html',
    // This must be true.
    handleCodeInApp: true,
};

// 1. Handle Email Link Sign-In
document.getElementById('emailSubmit').addEventListener('click', async function() {
    const email = document.getElementById('emailInput').value;
    if (!email) {
        alert("الرجاء إدخال بريدك الإلكتروني.");
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("الرجاء إدخال بريد إلكتروني صحيح.");
        return;
    }

    try {
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        
        // Save the email to local storage for later use
        window.localStorage.setItem('emailForSignIn', email);
        
        // Show the verification page
        openPage('emailVerificationPage');
        
        // Update the message to show the email
        document.getElementById('verificationEmailDisplay').textContent = email;

    } catch (error) {
        console.error("Error sending sign-in link:", error);
        
        // Handle specific Firebase errors
        if (error.code === 'auth/invalid-email') {
            alert("البريد الإلكتروني غير صحيح.");
        } else if (error.code === 'auth/user-disabled') {
            alert("هذا الحساب معطل.");
        } else if (error.code === 'auth/too-many-requests') {
            alert("حاولت عدة مرات. الرجاء المحاولة لاحقاً.");
        } else {
            alert("حدث خطأ: " + error.message);
        }
    }
});

// 2. Handle Google Sign-In
document.getElementById('googleLogin').addEventListener('click', async function() {
    const provider = new GoogleAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with Google:", result.user);
        // User is signed in, onAuthStateChanged will handle redirection
    } catch (error) {
        console.error("Error with Google Sign-In:", error);
        
        // Handle specific Firebase errors
        if (error.code === 'auth/popup-blocked') {
            alert("تم حظر النافذة المنبثقة. الرجاء السماح بالنوافذ المنبثقة.");
        } else if (error.code === 'auth/popup-closed-by-user') {
            alert("تم إغلاق نافذة تسجيل الدخول.");
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
            alert("عملية تسجيل الدخول غير مدعومة في هذا المتصفح.");
        } else {
            alert("حدث خطأ: " + error.message);
        }
    }
});

// 3. Handle GitHub Sign-In
document.getElementById('githubLogin').addEventListener('click', async function() {
    const provider = new GithubAuthProvider();
    
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in with GitHub:", result.user);
        // User is signed in, onAuthStateChanged will handle redirection
    } catch (error) {
        console.error("Error with GitHub Sign-In:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // Handle specific Firebase errors
        if (error.code === 'auth/popup-blocked') {
            alert("تم حظر النافذة المنبثقة. الرجاء السماح بالنوافذ المنبثقة.");
        } else if (error.code === 'auth/popup-closed-by-user') {
            // Don't show alert for user-closed popup (user intentionally closed it)
            console.log("User closed the popup");
        } else if (error.code === 'auth/account-exists-with-different-credential') {
            alert("يوجد حساب بنفس البريد الإلكتروني بطريقة تسجيل دخول مختلفة.");
        } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
            alert("عملية تسجيل الدخول غير مدعومة في هذا المتصفح.");
        } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/unauthorized-domain') {
            alert("تسجيل الدخول بـ GitHub غير مفعّل بشكل صحيح. يرجى التحقق من إعدادات Firebase.");
        } else {
            alert("حدث خطأ في تسجيل الدخول: " + error.message + "\n\nالرجاء مراجعة ملف GITHUB_OAUTH_SETUP.md");
        }
    }
});

// 4. Handle Microsoft Sign-In
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

// 5. Check for sign-in link on page load
if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
        // User opened the link on a different device or cleared storage.
        // Prompt the user for their email.
        email = window.prompt('الرجاء تأكيد بريدك الإلكتروني لإكمال عملية تسجيل الدخول.');
    }
    
    if (email) {
        try {
            await signInWithEmailLink(auth, email, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            console.log("User signed in with email link");
            // User is signed in, onAuthStateChanged will handle redirection
        } catch (error) {
            console.error("Error signing in with email link:", error);
            
            // Handle specific Firebase errors
            if (error.code === 'auth/invalid-email') {
                alert("البريد الإلكتروني غير صحيح.");
            } else if (error.code === 'auth/expired-action-code') {
                alert("رابط التحقق انتهت صلاحيته. الرجاء طلب رابط جديد.");
            } else if (error.code === 'auth/invalid-action-code') {
                alert("رابط التحقق غير صحيح.");
            } else {
                alert("حدث خطأ: " + error.message);
            }
        }
    }
}

// 5. Auth State Change Listener (Redirection)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        
        try {
            // Check if user data exists in Firebase Database
            const userRef = ref(db, 'users/' + user.uid);
            const snapshot = await get(userRef);
            
            if (!snapshot.exists()) {
                // New user, redirect to onboarding
                console.log("New user detected, redirecting to onboarding");
                setTimeout(() => {
                    window.location.href = 'https://studio.afnanai.com/id.html';
                }, 1000);
            } else {
                // Existing user, redirect to main page
                console.log("Existing user detected, redirecting to main page");
                setTimeout(() => {
                    window.location.href = 'https://studio.afnanai.com/index.html';
                }, 1000);
            }
        } catch (error) {
            console.error("Error checking user data:", error);
            // On error, redirect to onboarding to be safe
            setTimeout(() => {
                window.location.href = 'https://studio.afnanai.com/id.html';
            }, 1000);
        }
    } else {
        console.log("User is signed out");
        // User is signed out, ensure they are on the login page
        if (window.location.pathname.includes('index.html')) {
            // If they are on index.html, redirect them to login.html
            window.location.href = 'https://studio.afnanai.com/login.html';
        } else {
            // Ensure the login page is active
            openPage('loginPage');
        }
    }
});

// Expose functions for HTML onclick attributes
window.openPage = openPage;
window.closePage = closePage;
