document.addEventListener('DOMContentLoaded', () => {

    // CHATBOT PAGE LOGIC
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        let conversationHistory = [];

        const userInput = document.getElementById('user-input');
        const chatWindow = document.getElementById('chat-window');
        const chatContainer = document.getElementById('chat-window-container');
        const clearChatBtn = document.getElementById('clear-chat-btn');

        // Form submission handler
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = userInput.value.trim();
            if (!query) return;

            // Add user message to history and display it
            conversationHistory.push({ role: 'user', content: query });
            appendMessage(query, 'user');
            userInput.value = '';
            showTypingIndicator(true);

            const userTier = document.getElementById('user-tier').value;
            const severityLevel = document.getElementById('severity-level').value;

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: query,
                        tier: userTier,
                        severity: severityLevel,
                        history: conversationHistory // Send the whole history
                    }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                
                // Add AI response to history and display it
                conversationHistory.push({ role: 'assistant', content: data.response });
                appendMessage(data.response, 'ai');

            } catch (error) {
                console.error('Error fetching chat response:', error);
                appendMessage('Sorry, the server responded with an error. Please check the console.', 'ai');
            } finally {
                showTypingIndicator(false);
            }
        });

        // Clear Chat handler
        clearChatBtn.addEventListener('click', () => {
            conversationHistory = [];
            chatWindow.innerHTML = `
                <div class="message ai-message">
                    <p>Conversation cleared. How can I help you?</p>
                </div>`;
            scrollToBottom();
        });

        function appendMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            
            const p = document.createElement('p');
            p.textContent = text;
            messageDiv.appendChild(p);

            // Append the new message to the end
            chatWindow.appendChild(messageDiv);
            scrollToBottom();
        }

        function showTypingIndicator(show) {
            let indicator = document.getElementById('typing-indicator');
            if (show) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.id = 'typing-indicator';
                    indicator.classList.add('message', 'ai-message', 'typing-indicator');
                    indicator.innerHTML = '<span></span><span></span><span></span>';
                    chatWindow.appendChild(indicator);
                    scrollToBottom();
                }
            } else {
                if (indicator) indicator.remove();
            }
        }
        
        function scrollToBottom() {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // DASHBOARD PAGE LOGIC
    if (document.getElementById('requests-chart')) {
        // This logic remains the same
    }
});