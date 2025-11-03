// JavaScript for page navigation and interaction
function openPage(pageId) {
    document.querySelectorAll('.page, .full-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function closePage(pageId) {
    document.getElementById(pageId).classList.remove('active');
    // Logic to return to the previous page (e.g., loginPage)
    // For simplicity, we always return to the main login page.
    document.getElementById('loginPage').classList.add('active');
}

document.getElementById('emailSubmit').addEventListener('click', function() {
    // In a real app, this would send a request to a server
    openPage('emailVerificationPage');
});

document.getElementById('phoneLogin').addEventListener('click', function() {
    openPage('phoneLoginPage');
});

document.getElementById('phoneSubmit').addEventListener('click', function() {
    // In a real app, this would send an SMS code and move to the next page
    openPage('phoneVerificationPage');
});

document.getElementById('verifyPhone').addEventListener('click', function() {
    // This will now redirect to index.html
    window.location.href = 'index.html';
});

document.getElementById('proceedToIndex').addEventListener('click', function() {
    // This will now also redirect to index.html
    window.location.href = 'index.html';
});
