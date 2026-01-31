####Project Overview####

This project is an AI-powered L1 Customer Support Bot designed to work like Amazon or Flipkart customer support.
It provides fast, accurate, and safe responses to customer queries without guessing.

The bot combines:

Rule-based L1 support for common issues
AI fallback (LLM) for out-of-scope questions
Human agent escalation for sensitive or unresolved cases


#End-to-End Process Flow
##1.. Customer Sends a Message

The customer sends a message from the frontend (web/app/Postman) to the backend API.

Example:

{
  "message": "My product is damaged"
}

###2.. FastAPI Receives the Request

The /api/ai/chat endpoint receives the request and validates it using Pydantic schemas.
Ensures required fields are present
Prevents invalid data

###3.. L1 Rule-Based Support (First Priority)

The system first checks predefined business rules such as:
Product damaged
Return request
Delivery issue
Talk to agent
If a rule matches:
A ready-made, verified response is returned
AI is not called
High confidence score is assigned



###4.. AI Fallback (If No Rule Matches)

If no rule matches the message:
The request is sent to the LLM (Groq – LLaMA 3.1)
A strict system prompt controls AI behavior:
No guessing

Ask for clarification if data is missing
Stay professional and concise
AI is used only as a controlled fallback, not as the primary source.


Backend: FastAPI
AI Model: Groq (LLaMA 3.1)
