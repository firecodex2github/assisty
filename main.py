from fastapi import FastAPI
from db import engine,Base
from fastapi.staticfiles import StaticFiles
from routes.get_route import router as get_router
from routes.user_route import router as user_router
from routes.ticket_route import router as ticket_router
from routes.agent_route import router as agent_router
from routes.message_route import router as message_router
from fastapi.middleware.cors import CORSMiddleware


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

app.include_router(get_router)
app.include_router(user_router)
app.include_router(ticket_router)
app.include_router(agent_router)
app.include_router(message_router)
