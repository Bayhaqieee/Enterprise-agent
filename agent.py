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
        self.chat_deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT")
        self.embedding_deployment_name = os.getenv("AZURE_EMBEDDING_DEPLOYMENT_NAME")
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
            snippets = [item.get('snippet', '') for item in search_results.get('organic', [])[:3]]
            return " ".join(snippets) if snippets else "No search results found."
        except requests.exceptions.RequestException as e:
            print(f"Error calling Serper API: {e}")
            return f"Error performing search: {e}"

    def get_response(self, user_query: str, user_tier: str, severity: str, history: list) -> str:
        """
        Generates a response using the full conversation history for context.
        """
        try:
            # The last message is the current user query
            last_user_message = user_query
            search_context = ""

            if "what is" in last_user_message.lower() or "who is" in last_user_message.lower():
                 search_context = self.search_with_serper(last_user_message)
            
            system_prompt = f"""
            You are an Enterprise AI Assistant.
            User Context: Tier={user_tier.upper()}, Severity={severity.upper()}.
            Prioritize answers based on this context.
            Search Context (if any): {search_context}
            """

            # The 'messages' payload now includes the system prompt and the entire history
            messages_payload = [
                {"role": "system", "content": system_prompt}
            ] + history

            response = self.azure_client.chat.completions.create(
                model=self.chat_deployment_name,
                messages=messages_payload,
                temperature=0.7,
                max_tokens=800
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"An error occurred in get_response: {e}")
            return "I'm sorry, but I encountered an error while processing your request. The server might be misconfigured."