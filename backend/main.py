"""
SHADOW313 — Local Backend API
Proxies chat requests from the web dashboard to a local Ollama instance.
Eliminates CORS issues and provides a single endpoint for the front-end.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
import json

app = FastAPI(
    title="SHADOW313 Backend",
    description="Local proxy API for Ollama AI and future CLI tool integration",
    version="1.0.0",
)

# Allow the static web server (any localhost port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = (
    "You are SHADOW313 QTE (Quantum Thought Engine), an advanced quantum-computing "
    "and cybersecurity assistant. You are concise, technical, and accurate. "
    "Label simulations clearly and never claim real quantum hardware execution "
    "unless the user provides external results."
)


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class ChatRequest(BaseModel):
    message: str | None = None
    messages: list[ChatMessage] | None = None


@app.get("/health")
async def health():
    """Health check — also verifies Ollama connectivity."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{OLLAMA_URL}/api/tags")
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                return {
                    "status": "ok",
                    "ollama": "connected",
                    "models": model_names,
                    "active_model": OLLAMA_MODEL,
                }
    except Exception as exc:
        return {
            "status": "degraded",
            "ollama": "unreachable",
            "error": str(exc),
        }


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    Forward a chat request to the local Ollama instance.
    Accepts either:
      { "message": "Hello" }
    or:
      { "messages": [{"role": "user", "content": "Hello"}] }
    """
    # Normalize messages
    if request.messages:
        messages = [{"role": m.role, "content": m.content} for m in request.messages]
    elif request.message:
        messages = [{"role": "user", "content": request.message}]
    else:
        raise HTTPException(status_code=400, detail="A message is required")

    # Prepend system prompt
    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

    # Call Ollama
    async with httpx.AsyncClient(timeout=60) as client:
        try:
            resp = await client.post(
                f"{OLLAMA_URL}/api/chat",
                json={
                    "model": OLLAMA_MODEL,
                    "messages": full_messages,
                    "stream": False,
                },
            )
        except httpx.ConnectError:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Cannot connect to Ollama. "
                    "Make sure 'ollama serve' is running on your machine."
                ),
            )
        except httpx.ReadTimeout:
            raise HTTPException(
                status_code=504,
                detail="Ollama took too long to respond. Try a shorter message.",
            )
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=str(exc))

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Ollama error: {resp.text[:500]}",
        )

    data = resp.json()
    reply = data.get("message", {}).get("content", "").strip()

    if not reply:
        raise HTTPException(
            status_code=502,
            detail="Ollama returned an empty response.",
        )

    return {"reply": reply}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
