import asyncio
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents import Runner
from agent_orchestrator import build_agent

app = FastAPI(title="Real Estate Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = build_agent()
sessions = {}
sessions_lock = asyncio.Lock()


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    reply: str
    listings: list[dict] | None = None


async def get_session(conversation_id: str | None) -> tuple[str, dict]:
    async with sessions_lock:
        if conversation_id is None:
            conversation_id = str(uuid4())
        session = sessions.get(conversation_id)
        if session is None:
            session = {"previous_response_id": None, "context": {}}
            sessions[conversation_id] = session
        return conversation_id, session


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    conversation_id, session = await get_session(request.conversation_id)
    result = await Runner.run(
        agent,
        request.message,
        context=session["context"],
        previous_response_id=session["previous_response_id"],
        auto_previous_response_id=True,
    )
    session["previous_response_id"] = result.last_response_id
    reply = result.final_output if isinstance(result.final_output, str) else str(result.final_output)
    listings = None
    if isinstance(result.context_wrapper.context, dict):
        listings = result.context_wrapper.context.get("last_listings")
    return ChatResponse(conversation_id=conversation_id, reply=reply, listings=listings)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api_server:app", host="0.0.0.0", port=8000)
