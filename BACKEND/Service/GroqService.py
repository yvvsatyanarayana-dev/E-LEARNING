from Core.Config import settings
import requests
import json
from fastapi import HTTPException

# Using the provided key, or ideally falling back to environment variables in a real production system.
GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

class GroqService:
    @staticmethod
    def generate_chat_response(messages: list, model: str = "llama-3.1-8b-instant", max_tokens: int = 1000) -> str:
        """
        Calls the Groq chat completions API using the provided messages array.
        `messages` should be a list of dicts: [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}]
        """
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens
        }
        
        try:
            response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.HTTPError as e:
            print(f"Groq API HTTP Error: {e.response.text}")
            raise HTTPException(status_code=502, detail="Failed to communicate with AI service.")
        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal AI service error.")

groq_service = GroqService()
