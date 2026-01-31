# L1 Customer Support Ticketing & Chat System

## Project Overview

A web-based customer support system where users can raise tickets with screenshots and chat in real-time with L1 support agents. This project is designed as a minimal helpdesk MVP to demonstrate full‑stack and real‑time features.

## Tech Stack

* Backend: Python, FastAPI
* Database: MySQL 
* Authentication: JWT


## Key Features

* jwt implementation
* refresh token implementation
* Customer registration and login
* agent registration and login


## Project Structure

* models/ – Database models
* routes/ – API routes
* services/ – Business logic (user,agent,tickets, chat, AI)
* schemas/ – Request & response schemas


## API's

* user registeration - `http://127.0.0.1:8000/user/register`
* user login - `http://127.0.0.1:8000/user/login`
* agent registration - `http://127.0.0.1:8000/agent/register`
* agent login - `http://127.0.0.1:8000/agent/login`


## How It Works

1. Customer register then login.
2. server create refresh and access tokens while login
3. after login user can get for privilages
4. like as agent can register and login also


## Setup Instructions

1. Clone the repository
2. Create and activate a virtual environment
3. Install dependencies using `pip install -r requirements.txt`
4. Configure `.env` file with database and API keys
5. Run the application using `uvicorn main:app --reload` or `fastapi dev main.py`


## Status

* jwt with refresh token implemented
* user registration with login implemented
* agent registration with login implemented

## Author

Developed as part of a learning and internship project
