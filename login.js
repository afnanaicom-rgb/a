// Simple JavaScript for login page (can be extended for form validation or social login integration)

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const emailInput = document.querySelector('.input-field');
        const email = emailInput.value.trim();
        
        if (email === '') {
            alert('الرجاء إدخال عنوان البريد الإلكتروني.');
            return;
        }
        
        // In a real application, you would send this to a server
        console.log('Attempting to continue with email:', email);
        
        // Simulate successful login attempt and redirect to the chat page
        // alert(`تم إرسال رابط تسجيل الدخول إلى ${email}.`);
        // window.location.href = 'index.html';
    });
    
    // Add event listeners for social buttons if needed
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            // alert(`المتابعة باستخدام ${button.textContent.trim()} غير مفعلة حاليًا.`);
        });
    });
});
