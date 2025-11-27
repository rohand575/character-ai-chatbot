from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router as api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="Character AI Chatbot",
        version="0.1.0",
        description="Multi-character AI chatbot backend using OpenAI API."
    )

    # Allow CORS for frontend (we'll tighten this later)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # in dev only; restrict in prod
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api")

    return app


app = create_app()
