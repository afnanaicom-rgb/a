// DOM Elements
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatHistory = document.getElementById('chat-history');
const quickActions = document.getElementById('quick-actions');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarClose = document.getElementById('sidebar-close');
const overlay = document.getElementById('overlay');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initial welcome message
    addBotMessage('مرحباً! أنا Afnan AI. كيف يمكنني مساعدتك اليوم؟', false);
    
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    sidebarToggle.addEventListener('click', toggleSidebar);
    sidebarClose.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);
});

// Sidebar Functionality
function toggleSidebar() {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('visible');
}

// Send Message Function
function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') {
        return;
    }
    
    // Hide quick actions when the user starts chatting
    if (quickActions.style.display !== 'none') {
        quickActions.style.display = 'none';
    }

    // Add user message
    addUserMessage(message);
    
    // Clear input
    userInput.value = '';
    userInput.focus();
    
    // Simulate bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addBotMessage(response, true);
    }, 1000);
}

// Add User Message to Chat
function addUserMessage(message) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container user-message-container';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble user-message-bubble';
    messageBubble.textContent = message;

    messageContainer.appendChild(messageBubble);
    chatHistory.appendChild(messageContainer);
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Add Bot Message to Chat
function addBotMessage(message, withMeta) {
    const messageContainer = document.createElement('div');
    messageContainer.className = 'message-container bot-message-container';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble bot-message-bubble';
    
    // Bot Avatar/Name (Placeholder)
    const botInfo = document.createElement('div');
    botInfo.style.textAlign = 'center';
    botInfo.innerHTML = '<img src="https://i.postimg.cc/9X6V69zR/Photoroom.png" alt="Afnan" style="width: 30px; height: 30px; margin-bottom: 5px;"><br>Afnan';
    botInfo.style.marginBottom = '10px';
    
    const textContent = document.createElement('p');
    textContent.textContent = message;
    
    messageBubble.appendChild(botInfo);
    messageBubble.appendChild(textContent);

    if (withMeta) {
        // Add meta section with copy, like/dislike buttons
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        meta.innerHTML = `
            <span class="icon fa-copy" title="نسخ"></span>
            <span class="icon fa-thumbs-up" title="إعجاب"></span>
            <span class="icon fa-thumbs-down" title="عدم إعجاب"></span>
            <span class="icon fa-edit" title="تعديل"></span>
        `;
        messageBubble.appendChild(meta);
    }

    messageContainer.appendChild(messageBubble);
    chatHistory.appendChild(messageContainer);
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Simple Bot Response Logic
function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
        'مرحبا': 'أهلاً بك! كيف يمكنني خدمتك اليوم؟',
        'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته.',
        'من أنت': 'أنا Afnan AI، وكيل ذكاء اصطناعي مساعد.',
        'شكراً': 'على الرحب والسعة.',
    };
    
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return value;
        }
    }
    
    return 'هذا رد تجريبي من Afnan للتحقق من التصميم. يمكنك تجربة أزرار النسخ والتعديل والإعجاب.';
}
