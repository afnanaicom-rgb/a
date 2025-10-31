// DOM Elements
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add welcome message
    addBotMessage('مرحباً! أنا Afnan AI. كيف يمكنني مساعدتك اليوم؟');
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Send Message Function
function sendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') {
        return;
    }
    
    // Add user message
    addUserMessage(message);
    
    // Clear input
    userInput.value = '';
    userInput.focus();
    
    // Simulate bot response
    setTimeout(() => {
        const response = getBotResponse(message);
        addBotMessage(response);
    }, 500);
}

// Add User Message to Chat
function addUserMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add Bot Message to Chat
function addBotMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get Bot Response
function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Predefined responses
    const responses = {
        'مرحبا': 'مرحباً! كيف حالك؟',
        'السلام عليكم': 'وعليكم السلام ورحمة الله وبركاته! كيف أستطيع مساعدتك؟',
        'كيف حالك': 'أنا بحالة جيدة، شكراً للسؤال! كيف يمكنني مساعدتك؟',
        'من أنت': 'أنا Afnan AI، وكيل ذكاء اصطناعي مصمم لمساعدة العملاء والإجابة على استفساراتهم.',
        'ما اسمك': 'اسمي Afnan AI. يسعدني التحدث معك!',
        'شكراً': 'على الرحب والسعة! هل هناك شيء آخر يمكنني مساعدتك به؟',
        'شكرا': 'على الرحب والسعة! هل هناك شيء آخر يمكنني مساعدتك به؟',
        'وداعاً': 'وداعاً! شكراً لاستخدامك Afnan AI. أتطلع للحديث معك قريباً!',
        'وداعا': 'وداعاً! شكراً لاستخدامك Afnan AI. أتطلع للحديث معك قريباً!',
        'باي': 'باي! نتحدث قريباً إن شاء الله!',
        'ما هي خدماتك': 'أنا هنا لمساعدتك في الإجابة على الأسئلة والاستفسارات المختلفة. يمكنك أن تسأل عن أي موضوع تقريباً!',
        'هل تستطيع': 'نعم، أستطيع مساعدتك في معظم الأمور! جرب أن تسأل عن أي شيء.',
        'ساعدني': 'بالتأكيد! أنا هنا لمساعدتك. ما الذي تحتاج إلى مساعدة فيه؟',
    };
    
    // Check for exact matches
    for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return value;
        }
    }
    
    // Default responses based on message length
    if (userMessage.length < 5) {
        return 'أستطيع مساعدتك بشكل أفضل إذا أعطيتني المزيد من التفاصيل. هل يمكنك توضيح سؤالك؟';
    }
    
    // Random responses for unknown queries
    const defaultResponses = [
        'هذا سؤال مثير للاهتمام! دعني أفكر فيه... في الواقع، أنا قد أحتاج إلى معلومات أكثر لأتمكن من مساعدتك بشكل أفضل.',
        'أفهم سؤالك. هذا موضوع مهم جداً. هل يمكنك توضيح ما تقصد بشكل أكثر تفصيلاً؟',
        'شكراً على السؤال! أنا أعمل على تحسين معرفتي بهذا الموضوع. هل هناك شيء محدد تود أن تعرفه؟',
        'هذا موضوع جديد بالنسبة لي. هل يمكنك مساعدتي بمزيد من المعلومات؟',
        'أنا أحاول فهم ما تقول. هل يمكنك إعادة صياغة سؤالك بطريقة أخرى؟',
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// Utility: Format timestamp
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
}

// Optional: Add typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

// Optional: Remove typing indicator
function removeTypingIndicator(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}
