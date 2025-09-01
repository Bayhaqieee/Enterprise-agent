# Enterprise Agent AI

Welcome to my Project\! This project focuses on creating an enterprise-level AI assistant with a focus on production-grade features and analytics.

-----

### **Project Status**

🚧 **Status:** Completed

-----

### **Project Target**

  * **Enterprise-Grade AI Assistant:** To build a robust AI assistant capable of handling various user queries with different priority levels.
  * **Analytics Dashboard:** To provide a comprehensive dashboard for monitoring the AI's performance, user engagement, and other key metrics.
  * **Scalable and Maintainable:** To create a system that is easy to deploy, scale, and maintain in a production environment.

-----

### **Technologies**

  * **Python:** The core programming language used for the backend logic.
  * **Flask:** A micro web framework for creating the web application and API endpoints.
  * **Azure OpenAI:** Used for the core AI and language model capabilities.
  * **Serper:** A third-party API for performing Google searches.
  * **HTML/CSS/JavaScript:** For building the frontend of the web application.
  * **Chart.js:** A JavaScript library for creating charts and graphs on the dashboard.
  * **Jupyter Notebook:** For environment validation, agent testing, and performance monitoring.

-----

### **Setup**

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Bayhaqieee/AIResearcher_Writer_MultAgent.git
    ```

2.  **Install the required dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Set up your environment variables:**
    Create a `.env` file in the root directory and add the following variables:

    ```
    AZURE_API_KEY=YOUR_AZURE_API_KEY_HERE
    AZURE_OPENAI_ENDPOINT=YOUR_AZURE_ENDPOINT_HERE
    AZURE_API_VERSION=YOUR_AZURE_API_VERSION_HERE
    AZURE_OPENAI_CHAT_DEPLOYMENT_NAME=YOUR_AZURE_DEPLOYMENT_NAME_HERE
    SERPER_API_KEY=SERPER_API_KEY_HERE
    AZURE_EMBEDDING_DEPLOYMENT_NAME=YOUR_AZURE_EMBEDDING_DEPLOYMENT_NAME_HERE
    ```

4.  **Run the application:**

    ```bash
    python app.py
    ```

5.  **Run the Notebooks:**
    Each of the notebooks is already labeled for its specific purpose (environment validation, agent testing, etc.).
