// API service for chat backend integration

const API_BASE = "https://b6e9de9d5572.ngrok-free.app";

export interface ApiListing {
  price: string;
  details: string;
  phone: string;
}

export interface ChatResponse {
  conversation_id: string;
  reply: string;
  listings?: ApiListing[];
}

export async function sendMessage(
  message: string,
  conversationId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId ?? null,
    }),
  });
  
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  
  return res.json();
}
