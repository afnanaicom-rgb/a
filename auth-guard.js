// auth-guard.js

import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

// Check if the user is signed in
onAuthStateChanged(auth, (user) => {
    if (!user) {
        console.log("User is not signed in, redirecting to login page");
        // User is not signed in, redirect to login page
        window.location.href = 'https://afnanaicom-rgb.github.io/a/login.html';
    } else {
        console.log("User is signed in:", user.email);
        
        // Check if onboarding is complete
        const onboardingComplete = localStorage.getItem('onboardingComplete');
        
        if (!onboardingComplete) {
            console.log("Onboarding not complete, redirecting to id.html");
            window.location.href = 'https://afnanaicom-rgb.github.io/a/id.html';
        }
        // If user is signed in and onboarding is complete, the page loads normally.
    }
});
