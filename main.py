from fastapi import FastAPI
from db import engine,Base
from fastapi.staticfiles import StaticFiles
from routes.user_route import router as user_router
from routes.agent_route import router as agent_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app=FastAPI()

Base.metadata.create_all(bind=engine)  #for automatic table creation

# Mount static files (CSS/JS)
app.mount("/static", StaticFiles(directory="static"), name="static")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

app.include_router(user_router)
app.include_router(agent_router)
