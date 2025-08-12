import os
import requests
import json
from openai import AzureOpenAI

class EnterpriseAgent:
    """
    A class to encapsulate the AI logic, including connecting to Azure OpenAI
    and other third-party services like Serper for search.
    """
    def __init__(self):
        """
        Initializes the agent by setting up the Azure OpenAI client and API keys.
        """
        self.azure_client = AzureOpenAI(
            api_key=os.getenv("AZURE_API_KEY"),
            api_version=os.getenv("AZURE_API_VERSION"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
        )
        self.chat_deployment_name = os.getenv("AZURE_OPENAI_CHAT_DEPLOYMENT_NAME")
        self.embedding_deployment_name = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME")
        self.serper_api_key = os.getenv("SERPER_API_KEY")

    def search_with_serper(self, query: str):
        """
        Performs a search using the Serper Google Search API.
        """
        if not self.serper_api_key:
            return "Search tool not configured."

        payload = json.dumps({"q": query})
        headers = {
            'X-API-KEY': self.serper_api_key,
            'Content-Type': 'application/json'
        }
        try:
            response = requests.post("https://google.serper.dev/search", headers=headers, data=payload)
            response.raise_for_status()
            search_results = response.json()
            # Extract relevant snippets for the context
            snippets = [item.get('snippet', '') for item in search_results.get('organic', [])[:3]]
            return " ".join(snippets) if snippets else "No search results found."
        except requests.exceptions.RequestException as e:
            print(f"Error calling Serper API: {e}")
            return f"Error performing search: {e}"

    def get_response(self, user_query: str, user_tier: str, severity: str) -> str:
        """
        Generates a response from the AI by considering user context and calling Azure LLM.
        This function orchestrates tools like search if needed.
        """
        try:
            # Step 1: Use a simpler model to decide if a search is needed (optional, cost-effective)
            # For this example, we'll just check for keywords.
            if "what is" in user_query.lower() or "who is" in user_query.lower():
                 search_context = self.search_with_serper(user_query)
            else:
                 search_context = ""

            # Step 2: Construct a detailed system prompt for the main LLM
            system_prompt = f"""
            You are an Enterprise AI Assistant. Your primary goal is to provide accurate and helpful information.
            Pay close attention to the user's context provided below.

            **User Context:**
            - User Tier: {user_tier.upper()}
            - Request Severity: {severity.upper()}

            **Instructions:**
            - If the user is 'Premium' or 'Enterprise', provide more detailed, comprehensive answers.
            - If the severity is 'High' or 'Critical', be direct, concise, and prioritize actionable solutions.
            - If the query required a web search, the relevant context is provided below. Use it to formulate your answer.
            
            **Search Context:**
            {search_context}
            """

            # Step 3: Call the Azure OpenAI Chat model
            response = self.azure_client.chat.completions.create(
                model=self.chat_deployment_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_query}
                ],
                temperature=0.7,
                max_tokens=800
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"An error occurred: {e}")
            return "I'm sorry, but I encountered an error while processing your request. Please try again."

    def get_embedding(self, text: str):
        """
        Generates an embedding for a given text using Azure OpenAI embedding model.
        """
        try:
            response = self.azure_client.embeddings.create(
                model=self.embedding_deployment_name,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            return None