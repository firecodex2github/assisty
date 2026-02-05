# L1 Customer Support Ticketing & Chat System

## Project Overview

A web-based customer support system where users can raise tickets with screenshots and chat in real-time with L1 support agents. This project is designed as a minimal helpdesk MVP to demonstrate full‑stack and real‑time features.

## Tech Stack

* Backend: Python, FastAPI
* Frontend: HTML, CSS, JavaScript, Bootstrap
* Database: MySQL
* ORM: SQLAlchemy
* Authentication: JWT
* Real-time Communication: WebSockets
* AI Assistant (Out of Scope): Groq LLM (Llama 3)
* Server: Uvicorn

## Key Features

* Customer registration and login
* Create support tickets with category, subject, description,screenshots and pdf
* Auto-generated unique ticket number
* Real-time chat between customer and support agent per ticket
* Agent dashboard to view respond to tickets
* Ticket status management (Open, In Progress, Resolved, Closed)

## AI Assistant (Out of Scope)

* Rule-based L1 support for common issues
* AI-powered responses using Groq LLM


## Project Structure

* models/ – Database models
* routes/ – API routes
* services/ – Business logic (user,agent,tickets, chat, AI)
* schemas/ – Request & response schemas
* static/uploads/attachments/ – Uploaded screenshots and PDF files
* static/css/ – Contains custom CSS files for styling the application
* static/js/ – Contains JavaScript files for frontend logic and interactions
* static/images/ – Stores static images used in the UI 
* templates/ – Contains HTML template files for rendering frontend pages

## Out of scope

* AI-based L1 customer support bot.
* Handles common issues using rule-based L1 support (damaged, return, delivery).
* Uses Groq LLaMA 3.1 as an AI fallback when no rule matches.

* Example request:
* { "message": "My product is damaged" }


## How It Works

1. Customer logs in and creates a support ticket with screenshots and pdf's
2. System generates a unique ticket ID and chat channel
3. Agent views tickets from the dashboard and claims one
4. Customer and agent chat in real time using WebSockets
5. Agent updates ticket status until closure

## Prerequisites

Make sure the following are installed on your system:

* Python 3.9 or above
* MySQL Server
* Git
  
Verify installation using following commands:

* python --version
* mysql --version
* git --version


## Setup Instructions

1. Clone the repository
   * git clone <your-repository-url>
   * cd <project-folder-name>

2. Create Virtual Environment
   * python -m venv venv

3. Activate Virtual Environment
   * venv\Scripts\activate
   * After activation, your terminal will show (venv)
     
4. Install Project dependencies
   * All required packages are listed in requirement.txt
   * pip install -r requirement.txt
     
5. Database Configuration
  - Create Database
      * CREATE DATABASE cust_support;
  - Update Database URL (Configure your database connection in the project)
      * DATABASE_URL = "mysql+pymysql://dbusername:dbpassword@localhost:3306/cust_support"
        Replace:
        dbusername → your MySQL username
        dbpassword → your MySQL password
        
6. Environment Variables (.env File)
  - Create a file named .env in the project root directory and add:
      * LLM_API_KEY=your_openai_api_key_here
        
7. AI Feature Configuration
  - To enable AI features:
      * Add a valid LLM_API_KEY in .env
      * Restart the application
      * Without this key, AI-related functionality will not work.
        
8. Run the application
  - Start the FastAPI server using:
    * uvicorn main:app --reload or fastapi dev main.py
      
9. Application Access
  * Application URL : http://127.0.0.1:8000/
  * Swagger UI : http://127.0.0.1:8000/docs

## Notes

  * Tested only on Windows OS
  * Always activate virtual environment before running the app

## Status

* Core ticketing and chat features implemented
* AI chatbot implemented but marked as out of scope

## Author

Developed as part of a learning and internship project
