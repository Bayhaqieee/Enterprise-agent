document.addEventListener('DOMContentLoaded', () => {

    // CHATBOT PAGE LOGIC
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        let conversationHistory = []; // The "memory" of the chat

        const userInput = document.getElementById('user-input');
        const chatWindow = document.getElementById('chat-window');
        const chatContainer = document.getElementById('chat-window-container');
        const clearChatBtn = document.getElementById('clear-chat-btn');

        // Form submission handler
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = userInput.value.trim();
            if (!query) return;

            // Display user message (as plain text)
            appendMessage(query, 'user', false); // 'false' for not parsing markdown
            userInput.value = '';
            
            // Add user message to history
            conversationHistory.push({ role: 'user', content: query });
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
                        history: conversationHistory
                    }),
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.json();
                
                // Add AI response to history and display it (parsed as markdown)
                conversationHistory.push({ role: 'assistant', content: data.response });
                appendMessage(data.response, 'ai', true); // 'true' to parse markdown

            } catch (error) {
                console.error('Error fetching chat response:', error);
                appendMessage('Sorry, the server responded with an error. Please check the console.', 'ai', false);
            } finally {
                showTypingIndicator(false);
            }
        });

        // Clear Chat handler
        clearChatBtn.addEventListener('click', () => {
            conversationHistory = [];
            chatWindow.innerHTML = ''; // Clear the window
            appendMessage("Conversation cleared. How can I help you?", 'ai', false);
            scrollToBottom();
        });

        function appendMessage(text, sender, parseMarkdown) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            
            if (parseMarkdown) {
                // Use marked.js to convert Markdown to HTML
                messageDiv.innerHTML = marked.parse(text);
                // Apply syntax highlighting to any code blocks
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            } else {
                // For user messages, just display plain text
                const p = document.createElement('p');
                p.textContent = text;
                messageDiv.appendChild(p);
            }
            
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
    const requestsChart = document.getElementById('requests-chart');
    if (requestsChart) {
        fetchDashboardData();
    }

    async function fetchDashboardData() {
        try {
            const response = await fetch('/api/dashboard_data');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            renderCharts(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Optionally display an error message on the dashboard
            requestsChart.parentElement.innerHTML = '<div class="alert alert-danger">Could not load dashboard data.</div>';
        }
    }

    function renderCharts(data) {
        // Time Series Chart (Requests, Response Time, Success Rate)
        new Chart(document.getElementById('requests-chart'), {
            type: 'line',
            data: {
                labels: data.time_series.labels,
                datasets: [{
                    label: 'Total Requests',
                    data: data.time_series.total_requests,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    yAxisID: 'y',
                    tension: 0.3
                }, {
                    label: 'Avg Response Time (s)',
                    data: data.time_series.avg_response_time,
                    borderColor: 'rgba(255, 206, 86, 1)',
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    yAxisID: 'y1',
                    tension: 0.3
                }]
            },
            options: {
                scales: {
                    y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Requests' } },
                    y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Seconds' }, grid: { drawOnChartArea: false } }
                }
            }
        });

        // Tier Distribution Pie Chart
        new Chart(document.getElementById('tier-chart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(data.tier_distribution),
                datasets: [{
                    label: 'User Tiers',
                    data: Object.values(data.tier_distribution),
                    backgroundColor: ['#198754', '#ffc107', '#0dcaf0']
                }]
            }
        });

        // Severity Distribution Bar Chart
        new Chart(document.getElementById('severity-chart'), {
            type: 'bar',
            data: {
                labels: Object.keys(data.severity_distribution),
                datasets: [{
                    label: 'Request Count by Severity',
                    data: Object.values(data.severity_distribution),
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: { indexAxis: 'y' }
        });
    }
});