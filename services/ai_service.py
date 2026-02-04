import os
from groq import Groq
from utils.prompts import SYSTEM_PROMPT

from dotenv import load_dotenv
load_dotenv()

# --------------------------------------------------
# INIT GROQ CLIENT  ( THIS WAS MISSING)
# --------------------------------------------------
client = Groq(api_key=os.getenv("LLM_API_KEY"))

def handle_l1_support(msg: str):
    msg = msg.lower()

    if "damaged" in msg or "broken" in msg:
        return (
        
            "Sorry about that. You can raise a ticket:\n\n"
            "1. Login with your account*\n"
            "2. then raise a ticket\n"
            "3. chat with our support agent\n"
            "Our team will arrange pickup or replacement."
            
        )

    if "return" in msg:
        return (
            " **Return Product**\n\n"
            "Steps to return:\n\n"
            "1. Go to **My Orders**\n"
            "2. Select the product\n"
            "3. Click **Return / Refund**\n"
            "4. Choose reason\n"
            "5. Confirm pickup\n\n"
            "Refund will be processed after pickup."
            
        )

    if "not delivered" in msg or "delivery issue" in msg:
        return (
            " **Order Not Delivered**\n\n"
            "Please follow these steps:\n\n"
            "1. Go to **My Orders**\n"
            "2. Select the order\n"
            "3. Click **Need Help**\n"
            "4. Choose **Delivery Issue**\n\n"
            "Our support team will assist you."
            
        )

    if "agent" in msg or "customer care" in msg or "human" in msg:
        return (
            " **Connect with Support Agent**\n\n"
            "You can talk to a customer support agent by:\n\n"
            "1. create the issue ticket\n"
            "2. after the ticket is created, you can see the chat in the corner\n"
            "3. you can chat with the agent..\n\n"
            "An agent will solve the issue you shortly."
            
        )

    return None


# --------------------------------------------------
#  AI HANDLER (GROQ)
# --------------------------------------------------
chat_memory = []

def handle_ai(message: str):
    try:
        chat_memory.append({
            "role": "user",
            "content": message
        })

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                *chat_memory
            ],
            temperature=0.4,
            max_completion_tokens=200
        )
        reply = completion.choices[0].message.content

        chat_memory.append({
            "role": "assistant",
            "content": reply
        })

        # keep last 10 messages only
        chat_memory[:] = chat_memory[-10:]

        return reply

    except Exception as e:
        print("Groq error:", e)
        return "Something went wrong while answering. Please try again."




# MAIN ENTRY POINT
def get_ai_reply(message: str):
    l1 = handle_l1_support(message)
    if l1:
        return l1

    return handle_ai(message)

