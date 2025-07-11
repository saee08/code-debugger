from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
import os, logging

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("❌ OPENAI_API_KEY not set")

client = OpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
    default_headers={
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CodeFixerAI"
    }
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class CodeSnippet(BaseModel):
    code: str
    language: str 

@app.post("/debug/")
async def debug_code(payload: CodeSnippet):
    print("✅ Request received:", payload.code)

    prompt = f"Find and fix the bug in this {payload.language} code:\n{payload.code}\n\nReturn only:\n1. The corrected code in a code block\n2. A brief explanation of what you fixed."

    try:
        response = client.chat.completions.create(
            model="mistralai/mistral-7b-instruct",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=700
        )

        full_response = response.choices[0].message.content
        print("🧠 LLM Response:\n", full_response)

        # Try to extract code from markdown code block
        if "```" in full_response:
            parts = full_response.split("```")
            corrected_code = parts[1].strip() if len(parts) > 1 else full_response
            explanation = parts[2].strip() if len(parts) > 2 else "No clear explanation found."
        else:
            corrected_code = full_response
            explanation = "No explanation provided."

        return {
            "corrected_code": corrected_code,
            "explanation": explanation
        }

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail="Model failed to respond.")
