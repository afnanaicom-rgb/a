// script.js

import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, set, remove } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

// --- Global Variables and Constants ---
const TYPING_TEXT = "تحدث مع afnanai الآن";
const TYPING_INTERVAL = 100; // ms
const TYPING_DELAY = 20000; // 20 seconds

// Initialize Firebase Database
const db = getDatabase();
let currentChatId = null;
let currentUserId = null;

// --- Utility Functions ---

function simulateTyping(element, text, delay) {
    let index = 0;
    element.textContent = '';
    const interval = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
            setTimeout(() => simulateTyping(element, text, delay), delay);
        }
    }, TYPING_INTERVAL);
    return interval;
}

// --- Main Logic ---

document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('chatInput');
    const inputWrapper = document.getElementById('inputWrapper');
    const sendButton = document.getElementById('sendButton');
    const chatArea = document.getElementById('chatArea');
    const welcomeContent = document.getElementById('welcomeContent');
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menuButton');
    const newChatButton = document.getElementById('newChatButton');
    const suggestionGrid = document.getElementById('suggestionGrid');
    const suggestionCards = document.querySelectorAll('.suggestion-card');
    const headerLoginButton = document.getElementById('headerLoginButton');
    const userAccountDiv = document.getElementById('userAccount');
    const userNameSpan = document.getElementById('userName');
    const userEmailSpan = document.getElementById('userEmail');
    const userProfileImage = document.getElementById('userProfileImage');
    const logoutButton = document.getElementById('logoutButton');
    const imageUploadButton = document.getElementById('imageUploadButton');
    const imageInput = document.getElementById('imageInput');
    const typingTextElement = document.getElementById('typingText');
    const chatHistoryList = document.getElementById('chatHistoryList');

    let isGenerating = false;
    let assistantResponseTimeout = null;
    let messageToEdit = null;
    let typingInterval = null;
    let isChatActive = false;

    const ICONS = {
        send: "<i class='bx bx-up-arrow-alt'></i>",
        stop: "<i class='bx bx-stop'></i>",
        edit: "<i class='bx bx-check'></i>"
    };
    
    // Start typing effect on load
    typingInterval = simulateTyping(typingTextElement, TYPING_TEXT, TYPING_DELAY);

    function autoResize() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    function toggleSidebar() { 
        sidebar.classList.toggle('visible'); 
    }
    
    function startNewChat() {
        chatArea.innerHTML = '';
        welcomeContent.classList.remove('hidden');
        chatArea.classList.remove('visible');
        suggestionGrid.classList.remove('hidden');
        resetInputArea();
        isChatActive = false;
        currentChatId = null; // Reset current chat ID
        // Restart typing effect
        if (typingInterval) clearInterval(typingInterval);
        typingInterval = simulateTyping(typingTextElement, TYPING_TEXT, TYPING_DELAY);
        
        // Remove active class from all history items
        document.querySelectorAll('.chat-history-item').forEach(item => item.classList.remove('active'));
    }

    function addMessage(content, type, saveToDb = true) {
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${type}-wrapper`;
        
        let messageDiv;
        let actionBar = document.createElement('div');
        actionBar.className = 'action-bar';

        if (type === 'assistant') {
            const avatar = document.createElement('img');
            avatar.src = 'https://i.postimg.cc/9X6V69zR/Photoroom.png';
            avatar.alt = 'Afnan Avatar';
            avatar.className = 'assistant-avatar';
            wrapper.appendChild(avatar);

            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'message-content-wrapper';
            
            const nameSpan = document.createElement('span');
            nameSpan.className = 'assistant-name';
            nameSpan.textContent = 'Afnan';
            contentWrapper.appendChild(nameSpan);

            messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.textContent = content;
            contentWrapper.appendChild(messageDiv);
            
            actionBar.innerHTML = `
                <button class="action-btn-copy" title="نسخ"><i class='bx bx-copy'></i></button>
                <button title="مشاركة"><i class='bx bx-share-alt'></i></button>
                <button title="إعجاب"><i class='bx bx-like'></i></button>
            `;
            contentWrapper.appendChild(actionBar);
            wrapper.appendChild(contentWrapper);

        } else { // User
            messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            messageDiv.textContent = content;
            wrapper.appendChild(messageDiv);

            actionBar.innerHTML = `
                <button class="action-btn-copy" title="نسخ"><i class='bx bx-copy'></i></button>
                <button class="action-btn-edit" title="تعديل"><i class='bx bx-pencil'></i></button>
            `;
            wrapper.appendChild(actionBar);
        }

        chatArea.appendChild(wrapper);
        chatArea.scrollTop = chatArea.scrollHeight;

        // Save to Firebase
        if (saveToDb && currentUserId) {
            if (!currentChatId) {
                // Start a new chat
                const newChatRef = push(ref(db, `users/${currentUserId}/chats`));
                currentChatId = newChatRef.key;
                // Set initial chat title (first user message)
                set(newChatRef, { title: content.substring(0, 30) + '...', timestamp: Date.now() });
            }
            
            // Add message to the chat
            push(ref(db, `users/${currentUserId}/chats/${currentChatId}/messages`), {
                content: content,
                type: type,
                timestamp: Date.now()
            });
        }
    }

    function startChatMode() {
        welcomeContent.classList.add('hidden');
        chatArea.classList.add('visible');
        suggestionGrid.classList.add('hidden');
        isChatActive = true;
        // Stop typing effect
        if (typingInterval) clearInterval(typingInterval);
    }
    
    function updateSendButton(state) {
        sendButton.innerHTML = ICONS[state];
        if (state === 'stop') {
            sendButton.classList.add('stop-generation');
        } else {
            sendButton.classList.remove('stop-generation');
        }
    }

    function resetInputArea() {
        textarea.value = '';
        autoResize.call(textarea);
        messageToEdit = null;
        if (isGenerating) stopGeneration();
        updateSendButton('send');
    }

    function saveEdit() {
        if (!messageToEdit) return;
        const newContent = textarea.value.trim();
        if (newContent) {
            messageToEdit.textContent = newContent;
            // TODO: Update message in Firebase
        }
        resetInputArea();
    }

    function stopGeneration() {
        if (assistantResponseTimeout) {
            clearTimeout(assistantResponseTimeout);
            assistantResponseTimeout = null;
        }
        isGenerating = false;
        updateSendButton('send');
    }

    function handleSend() {
        if (isGenerating) {
            stopGeneration();
            return;
        }

        if (messageToEdit) {
            saveEdit();
            return;
        }

        const message = textarea.value.trim();
        if (!message) return;

        if (!isChatActive) startChatMode();
        
        addMessage(message, 'user');
        resetInputArea();

        isGenerating = true;
        updateSendButton('stop');

        // Simulate assistant response
        assistantResponseTimeout = setTimeout(() => {
            addMessage('هذا رد تجريبي من Afnan للتحقق من التصميم. يمكنك تجربة أزرار النسخ والتعديل والإعجاب.', 'assistant');
            isGenerating = false;
            updateSendButton('send');
        }, 2000);
    }

    // --- Chat History Functions ---
    function loadChatHistory(userId) {
        const chatsRef = ref(db, `users/${userId}/chats`);
        onValue(chatsRef, (snapshot) => {
            chatHistoryList.innerHTML = ''; // Clear current list
            snapshot.forEach((childSnapshot) => {
                const chatId = childSnapshot.key;
                const chatData = childSnapshot.val();
                
                const item = document.createElement('div');
                item.className = 'chat-history-item';
                item.setAttribute('data-chat-id', chatId);
                item.innerHTML = `<i class='bx bx-message-square-detail'></i><span>${chatData.title}</span>`;
                
                item.addEventListener('click', () => {
                    loadChat(chatId);
                });
                
                chatHistoryList.appendChild(item);
            });
        });
    }

    function loadChat(chatId) {
        // Set active chat
        currentChatId = chatId;
        
        // Update active class in sidebar
        document.querySelectorAll('.chat-history-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`.chat-history-item[data-chat-id="${chatId}"]`).classList.add('active');
        
        // Load messages
        const messagesRef = ref(db, `users/${currentUserId}/chats/${chatId}/messages`);
        onValue(messagesRef, (snapshot) => {
            chatArea.innerHTML = ''; // Clear current chat area
            startChatMode(); // Ensure chat area is visible
            
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                addMessage(message.content, message.type, false); // Don't save again
            });
        }, { onlyOnce: true }); // Load once, then rely on real-time updates if needed
    }

    // --- Firebase Auth Listener and UI Update ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            currentUserId = user.uid;
            headerLoginButton.style.display = 'none';
            logoutButton.style.display = 'flex';
            
            // Update user info in sidebar
            userNameSpan.textContent = user.displayName || user.email.split('@')[0];
            userEmailSpan.textContent = user.email;
            userEmailSpan.style.display = 'block';
            
            if (user.photoURL) {
                userProfileImage.src = user.photoURL;
                userProfileImage.style.display = 'block';
            } else {
                // Hide image and show default icon (if you had one)
                userProfileImage.style.display = 'none';
            }
            
            // Load chat history
            loadChatHistory(user.uid);

        } else {
            // User is signed out
            currentUserId = null;
            headerLoginButton.style.display = 'flex';
            logoutButton.style.display = 'none';
            userNameSpan.textContent = 'حسابك';
            userEmailSpan.style.display = 'none';
            userProfileImage.style.display = 'none';
            chatHistoryList.innerHTML = ''; // Clear history
        }
    });

    // --- Logout Handler ---
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // Redirection is handled by auth-guard.js on index.html
            // For login.html, the listener will update the UI
        } catch (error) {
            console.error("Error signing out:", error);
            alert("حدث خطأ أثناء تسجيل الخروج.");
        }
    });

    // --- Image Upload Handler ---
    imageUploadButton.addEventListener('click', () => {
        imageInput.click(); // Trigger file input click
    });

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, you would upload the file to Firebase Storage here
            // For now, we just show a message
            const message = `تم اختيار صورة: ${file.name}. (يجب تفعيل ميزة رفع الصور في التطبيق الفعلي)`;
            if (!isChatActive) startChatMode();
            addMessage(message, 'user');
            resetInputArea();
        }
    });

    // --- Event Listeners ---
    menuButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from closing sidebar immediately
        toggleSidebar();
    });
    newChatButton.addEventListener('click', startNewChat);

    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('focus', () => inputWrapper.classList.add('focused'));
    textarea.addEventListener('blur', () => inputWrapper.classList.remove('focused'));

    sendButton.addEventListener('click', handleSend);
    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    suggestionCards.forEach(card => {
        card.addEventListener('click', () => {
            textarea.value = card.querySelector('span').textContent;
            textarea.focus();
            autoResize.call(textarea);
        });
    });

    chatArea.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.action-btn-copy');
        const editBtn = e.target.closest('.action-btn-edit');

        if (copyBtn) {
            const textToCopy = copyBtn.closest('.message-wrapper').querySelector('.message').textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log('Copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        }

        if (editBtn) {
            const messageToEditElement = editBtn.closest('.message-wrapper').querySelector('.message');
            startEdit(messageToEditElement);
        }
    });

    // New: Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnMenuButton = menuButton.contains(e.target);

        if (sidebar.classList.contains('visible') && !isClickInsideSidebar && !isClickOnMenuButton) {
            toggleSidebar();
        }
    });
});
