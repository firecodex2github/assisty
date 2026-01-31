# L1 Customer Support – Ticketing & Chat System  
## My Contribution (Customer & Agent Ticket Management)

## Project Overview
This project is a L1 Customer Support Ticketing System where customers can raise support tickets and communicate with support agents through real-time chat.  
My responsibility in this project was to design and implement **both backend and frontend logic** related to **ticket creation, ticket viewing, chat, notifications, and agent dashboard features**.



## My Role & Responsibilities

I worked mainly on the Customer Ticket Flow and Agent Ticket Management, covering both API development (FastAPI) and frontend integration (HTML, CSS, JavaScript).



## Features Implemented by Me

### 1. Customer Ticket Creation
- Customer can **create a support ticket** with issue details.
- Each ticket is assigned a **unique ticket number**.
- Ticket is automatically available in both **customer view** and **agent dashboard**.
- Also can add Screenshots of  maximum 3 images should not exceeds size of 3mp 
- Also can add pdf of  maximum 2 pdfs should not exceeds size of 5mp 

**API:**
POST /createticket



### 2. View Customer Tickets (My Tickets)
- Customer can see **all tickets created by them**.
- Shows ticket number, status, priority, and last update.

**API:**
GET /api/mytickets

### 3. Ticket Details View
- Customer and agent can view **complete ticket details**.
- Includes subject, description, status, priority, and chat history.

**API:**
GET /api/ticket-details/{ticket_no}

### 4. Per-Ticket Chat Room (Real-Time)
- Each ticket has its **own chat room**.
- Implemented **WebSocket-based real-time messaging**.
- Messages are stored and can be reloaded.

**APIs:**
GET /api/messages/{ticket_no}
WebSocket /ws/chat/{ticket_no}/{sender}

### 5. Chat Notification (Unread Message – Red Dot)
- Implemented **unread message indicator (red dot)**.
- Uses browser storage to track unread messages.
- Clears notification when chat is opened.


### 6. Agent Dashboard – View All Tickets
- Agent can view **all customer-created tickets** in one dashboard.
- Tickets are listed with status and priority.

**API:**
GET /agent/all-tickets

### 7. Ticket Status Management (Agent)
- Agent can update ticket status:
  - `Open → In Progress → Resolved → Closed`
- Once ticket is **Closed**, chat input is **disabled for customer**.

**API:**
POST /api/tickets/{ticket_no}/status

### 8. Ticket Priority Management (Agent)
- Agent can update ticket priority (Low / Medium / High).
- Priority changes reflect immediately for the respective ticket.

**API:**
POST /api/tickets/{ticket_no}/priority

### 9. Logged-In User Information
- Used to fetch logged-in user email for ticket creation

**API:**
GET /user/me/email

## Technologies Used
- **Backend:** Python, FastAPI, SQLAlchemy
- **Frontend:** HTML, CSS, JavaScript
- **Real-Time:** WebSockets
- **Auth:** JWT-based authentication
- **Database:** MySQL 

## Key Highlights of My Work
- End-to-end **ticket lifecycle handling**
- Real-time **chat system per ticket**
- **Unread message notification logic**
- Agent-side **status & priority control**
- Clean separation between **customer and agent actions**
- Fully integrated **backend APIs + frontend behavior**


## Conclusion
My contribution ensures that:
- Customers can **create, view, and chat on tickets easily**
- Agents can **manage tickets efficiently**
- Ticket status, priority, and chat behavior are properly synchronized
- The system behaves like a **real-world L1 customer support helpdesk**
