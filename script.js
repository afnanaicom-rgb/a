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
    const mainContainer = document.querySelector('.main-container'); // Added this

    let isGenerating = false;
    let assistantResponseTimeout = null;
    let messageToEdit = null;

    const ICONS = {
        send: "<i class='bx bx-up-arrow-alt'></i>",
        stop: "<i class='bx bx-stop'></i>",
        edit: "<i class='bx bx-check'></i>"
    };
    
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
    }

    function addMessage(content, type) {
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
    }

    function startChatMode() {
        welcomeContent.classList.add('hidden');
        chatArea.classList.add('visible');
        suggestionGrid.classList.add('hidden');
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

    function startEdit(messageElement) {
        messageToEdit = messageElement;
        textarea.value = messageElement.textContent;
        textarea.focus();
        autoResize.call(textarea);
        updateSendButton('edit');
    }

    function saveEdit() {
        if (!messageToEdit) return;
        const newContent = textarea.value.trim();
        if (newContent) {
            messageToEdit.textContent = newContent;
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

        if (!chatArea.classList.contains('visible')) startChatMode();
        
        addMessage(message, 'user');
        resetInputArea();

        isGenerating = true;
        updateSendButton('stop');

        assistantResponseTimeout = setTimeout(() => {
            addMessage('هذا رد تجريبي من Afnan للتحقق من التصميم. يمكنك تجربة أزرار النسخ والتعديل والإعجاب.', 'assistant');
            isGenerating = false;
            updateSendButton('send');
        }, 2000);
    }

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
