import os
from groq import Groq
from utils.prompts import SYSTEM_PROMPT

from dotenv import load_dotenv
load_dotenv()


# INIT GROQ CLIENT  ( THIS WAS MISSING)

client = Groq(api_key=os.getenv("LLM_API_KEY"))


#  L1 SUPPORT (RULE-BASED – NEVER FAILS)

def handle_l1_support(msg: str):
    msg = msg.lower()

    if "damaged" in msg or "broken" in msg:
        return (
        
            "Sorry about that. You can raise a replacement or refund:\n\n"
            "1. Login with your account\n"
            "2. Then raise a ticket\n"
            "3. Chat with our support agent\n"
            "Our team will arrange pickup or replacement."
            
        )

    if "return" in msg:
        return (
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
            "Please follow these steps:\n\n"
            "1. Go to **My Orders**\n"
            "2. Select the order\n"
            "3. Click **Need Help**\n"
            "4. Choose **Delivery Issue**\n\n"
            "Our support team will assist you."
            
        )

    if "agent" in msg or "customer care" in msg or "human" in msg:
        return (
            "You can talk to a customer support agent by:\n\n"
            "1. create a issue ticket**\n"
            "2. After the ticket is created,you can see the chat in the corner\n"
            "3. you can chat with the agent\n\n"
            "An agent will solve the issue  you shortly."
            
        )

    return None



#  AI HANDLER (GROQ)

def handle_ai(message: str):
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": message}
            ],
            temperature=0.2,
            max_completion_tokens=250,
            top_p=1
        )

        reply = completion.choices[0].message.content
        return reply

    except Exception as e:
        print("Groq error:", e)
        return (
            "Something went wrong while answering. Please try again."
            
        )



#  MAIN ENTRY POINT

def get_ai_reply(message: str):
    l1 = handle_l1_support(message)
    if l1:
        return l1

    return handle_ai(message)

