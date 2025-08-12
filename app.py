import os
import json
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from agent import EnterpriseAgent

# Load environment variables from .env file
load_dotenv()

# Add this check to debug your .env file
print("Checking Environment Variables ")
print(f"AZURE_API_KEY loaded: {bool(os.getenv('AZURE_API_KEY'))}")
print(f"AZURE_OPENAI_ENDPOINT loaded: {bool(os.getenv('AZURE_OPENAI_ENDPOINT'))}")
print(f"AZURE_OPENAI_CHAT_DEPLOYMENT_NAME loaded: {bool(os.getenv('AZURE_OPENAI_CHAT_DEPLOYMENT_NAME'))}")


# Initialize Flask app
app = Flask(__name__)

# Initialize the AI agent
try:
    agent = EnterpriseAgent()
except Exception as e:
    print(f"CRITICAL: Failed to initialize EnterpriseAgent. Check your .env file and API keys. Error: {e}")
    agent = None

# HTML Page Routes

@app.route('/')
def index():
    """Renders the main chatbot page."""
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    """Renders the analytics dashboard page."""
    return render_template('dashboard.html')


# API Endpoints

@app.route('/chat', methods=['POST'])
def chat():
    """API endpoint for the chatbot, now with history."""
    if not agent:
        return jsonify({'response': 'AI Agent is not available. Please check server configuration.'}), 500

    data = request.get_json()
    user_query = data.get('query')
    user_tier = data.get('tier', 'free')
    severity = data.get('severity', 'low')
    history = data.get('history', []) # Get history from request

    if not user_query:
        return jsonify({'error': 'Query is required.'}), 400

    # Get the AI's response using the new history-aware method
    ai_response = agent.get_response(user_query, user_tier, severity, history)
    
    return jsonify({'response': ai_response})

@app.route('/api/dashboard_data')
def dashboard_data():
    """API endpoint to provide synthetic data for the dashboard."""
    try:
        # Generate synthetic data for the last 7 days
        labels = [(datetime.now() - timedelta(days=i)).strftime('%b %d') for i in range(6, -1, -1)]
        
        # Generate data points
        total_requests = [random.randint(800, 1500) for _ in range(7)]
        avg_response_time = [round(random.uniform(0.5, 2.5), 2) for _ in range(7)]
        
        # Data for the pie chart
        tier_distribution = {
            'Free': random.randint(5000, 8000),
            'Premium': random.randint(2000, 4000),
            'Enterprise': random.randint(500, 1500)
        }

        # Data for the severity bar chart
        severity_distribution = {
            'Low': random.randint(6000, 9000),
            'Medium': random.randint(1500, 3000),
            'High': random.randint(200, 800)
        }

        # Consolidate into a single JSON response
        data = {
            'time_series': {
                'labels': labels,
                'total_requests': total_requests,
                'avg_response_time': avg_response_time
            },
            'tier_distribution': tier_distribution,
            'severity_distribution': severity_distribution
        }
        
        return jsonify(data)
    except Exception as e:
        print(f"Error in /api/dashboard_data: {e}")
        return jsonify({"error": "Failed to generate dashboard data"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)