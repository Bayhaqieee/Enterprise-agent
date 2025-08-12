document.addEventListener('DOMContentLoaded', () => {

    // CHATBOT PAGE LOGIC
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        const userInput = document.getElementById('user-input');
        const chatWindow = document.getElementById('chat-window');
        const sendBtn = document.getElementById('send-btn');

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = userInput.value.trim();
            if (!query) return;

            // Get context from dropdowns
            const userTier = document.getElementById('user-tier').value;
            const severityLevel = document.getElementById('severity-level').value;

            // Display user message
            appendMessage(query, 'user');
            userInput.value = '';
            showTypingIndicator(true);

            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: query,
                        tier: userTier,
                        severity: severityLevel
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                appendMessage(data.response, 'ai');

            } catch (error) {
                console.error('Error fetching chat response:', error);
                appendMessage('Sorry, something went wrong. Please try again.', 'ai');
            } finally {
                showTypingIndicator(false);
            }
        });

        function appendMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', `${sender}-message`);
            
            const p = document.createElement('p');
            p.textContent = text;
            messageDiv.appendChild(p);

            chatWindow.prepend(messageDiv); // Prepend to keep latest at bottom
        }

        function showTypingIndicator(show) {
            let indicator = document.getElementById('typing-indicator');
            if (show) {
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.id = 'typing-indicator';
                    indicator.classList.add('message', 'ai-message', 'typing-indicator');
                    indicator.innerHTML = '<span></span><span></span><span></span>';
                    chatWindow.prepend(indicator);
                }
            } else {
                if (indicator) {
                    indicator.remove();
                }
            }
        }
    }

    // DASHBOARD PAGE LOGIC
    if (document.getElementById('requests-chart')) {
        fetchDashboardData();
    }

    async function fetchDashboardData() {
        try {
            const response = await fetch('/api/dashboard_data');
            const data = await response.json();
            renderCharts(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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