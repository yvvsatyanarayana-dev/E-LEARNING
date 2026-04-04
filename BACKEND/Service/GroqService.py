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
        if not GROQ_API_KEY or GROQ_API_KEY == "gsk_..." or "YOUR_API_KEY" in GROQ_API_KEY:
            # Mock Fallback for Development
            user_msg = messages[-1]["content"] if messages else ""
            msg_lower = user_msg.lower()
            
            if "resume" in msg_lower or "personal" in msg_lower:
                import re
                # Simple extraction: "I'm Name", "I am Name", "My name is Name"
                name_match = re.search(r"(?:i am|i'm|my name is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)", user_msg, re.I)
                name = name_match.group(1) if name_match else "Student Name"
                
                # Simple extraction: "at University", "from University", "University Name"
                univ_match = re.search(r"(?:at|from|of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+University|College|Institute|School)?)", user_msg, re.I)
                univ = univ_match.group(1) if univ_match else "University Name"
                
                # Simple extraction: "B.Tech", "CSE", "Computer Science"
                degree_match = re.search(r"(B\.?Tech|M\.?Tech|B\.?Sc|M\.?Sc|B\.?A|M\.?A|PhD|Computer Science|CSE|ECE|IT)", user_msg, re.I)
                degree = degree_match.group(1) if degree_match else "B.Tech Computer Science"

                return json.dumps({
                    "personal": { "fullName": name, "email": f"{name.lower().replace(' ', '.')}@gmail.com", "phone": "+91 98765 43210", "linkedin": f"linkedin.com/in/{name.lower().replace(' ', '')}", "github": f"github.com/{name.lower().replace(' ', '')}", "location": "Global", "summary": f"Aspiring {degree} student with a passion for building scalable web applications." },
                    "education": { "degree": degree, "institution": univ, "duration": "2021 – 2025", "cgpa": "8.5", "location": "Global" },
                    "experiences": [{ "id": 1, "role": "Software Intern", "company": "Tech Solutions", "duration": "Jun 2024 - Aug 2024", "desc": "Assisted in building REST APIs and frontend components using React." }],
                    "projects": [{ "id": 1, "name": "E-Learning Platform", "tech": "React, FastAPI, PostgreSQL", "desc": "A full-stack learning management system with AI integration." }],
                    "skills": ["JavaScript", "React", "Python", "FastAPI", "SQL"],
                    "certs": [{ "name": "Full Stack Development", "issuer": "Coursera", "date": "2023" }]
                })
            return f"I am Lucyna, your AI mentor. (Note: GROQ_API_KEY is not set. This is a mock response). How can I help you today?"


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
            # If it's a 401, it's likely a bad API key
            if e.response.status_code == 401:
                 raise HTTPException(status_code=502, detail="Invalid Groq API Key. Please update your .env file.")
            raise HTTPException(status_code=502, detail="Failed to communicate with AI service.")
        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal AI service error.")


groq_service = GroqService()
