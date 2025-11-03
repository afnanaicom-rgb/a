// login.js

import { auth } from "./firebase-config.js";
import { 
    sendSignInLinkToEmail, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

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
    url: 'https://afnanaicom-rgb.github.io/a/login.html',
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
    
    // Set custom parameters for Google Sign-In
    provider.setCustomParameters({
        'prompt': 'consent'
    });

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

// 3. Check for sign-in link on page load
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

// 4. Auth State Change Listener (Redirection)
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        // User is signed in, redirect to the chat page
        setTimeout(() => {
            window.location.href = 'https://afnanaicom-rgb.github.io/a/index.html';
        }, 1000);
    } else {
        console.log("User is signed out");
        // User is signed out, ensure they are on the login page
        if (window.location.pathname.includes('index.html')) {
            // If they are on index.html, redirect them to login.html
            window.location.href = 'https://afnanaicom-rgb.github.io/a/login.html';
        } else {
            // Ensure the login page is active
            openPage('loginPage');
        }
    }
});

// Expose functions for HTML onclick attributes
window.openPage = openPage;
window.closePage = closePage;
