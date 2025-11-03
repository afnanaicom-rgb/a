// login.js

import { auth } from "./firebase-config.js";
import { 
    sendSignInLinkToEmail, 
    isSignInWithEmailLink, 
    signInWithEmailLink,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

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
    url: window.location.href,
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
        alert("حدث خطأ أثناء إرسال رابط التحقق. الرجاء المحاولة مرة أخرى.");
    }
});

// 2. Handle Google Sign-In
document.getElementById('googleLogin').addEventListener('click', async function() {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // User is signed in, onAuthStateChanged will handle redirection
    } catch (error) {
        console.error("Error with Google Sign-In:", error);
        alert("حدث خطأ أثناء تسجيل الدخول باستخدام جوجل.");
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
            // User is signed in, onAuthStateChanged will handle redirection
        } catch (error) {
            console.error("Error signing in with email link:", error);
            alert("حدث خطأ أثناء تسجيل الدخول عبر الرابط.");
        }
    }
}

// 4. Auth State Change Listener (Redirection)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, redirect to the chat page
        window.location.href = 'index.html';
    } else {
        // User is signed out, ensure they are on the login page
        if (window.location.pathname.endsWith('index.html')) {
            // If they are on index.html, redirect them to login.html
            window.location.href = 'login.html';
        } else {
            // Ensure the login page is active
            openPage('loginPage');
        }
    }
});

// --- Other Event Listeners (Kept for compatibility, but Firebase handles the core logic) ---

// The phone login is not implemented with Firebase Auth in this version, so we remove the listeners
// document.getElementById('phoneLogin').addEventListener('click', function() {
//     openPage('phoneLoginPage');
// });

// document.getElementById('phoneSubmit').addEventListener('click', function() {
//     openPage('phoneVerificationPage');
// });

// document.getElementById('verifyPhone').addEventListener('click', function() {
//     window.location.href = 'index.html';
// });

document.getElementById('proceedToIndex').addEventListener('click', function() {
    // This button is now redundant as onAuthStateChanged handles redirection
    // We can keep it to give the user a way to proceed if they think they are signed in
    window.location.href = 'index.html';
});

// Expose functions for HTML onclick attributes
window.openPage = openPage;
window.closePage = closePage;
