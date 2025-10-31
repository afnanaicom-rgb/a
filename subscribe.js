// Simple JavaScript for subscribe page (can be extended for payment gateway integration)

document.addEventListener('DOMContentLoaded', function() {
    const selectButtons = document.querySelectorAll('.select-btn');
    
    selectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const planName = this.closest('.plan-card').querySelector('h2').textContent;
            
            if (this.classList.contains('free-btn')) {
                // alert(`لقد اخترت ${planName}. يمكنك البدء باستخدام الخطة المجانية.`);
            } else if (this.classList.contains('pro-btn')) {
                // alert(`سيتم توجيهك إلى صفحة الدفع للاشتراك في ${planName}.`);
                // In a real application, this would redirect to a payment page
            }
        });
    });
});
