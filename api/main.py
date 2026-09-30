"""FinLuxa API — FastAPI application skeleton.

Run from the project root (the folder that contains ``brain.py``):

    uvicorn api.main:app --reload

This skeleton only wires up CORS, error handling, and a health check.
Business endpoints are added separately, once the UI/logic specs are final.
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from exceptions import (
    DatabaseConnectionError,
    FinLuxaError,
    QueryExecutionError,
    RecordInsertionError,
    ValidationError,
)

logger = logging.getLogger("finluxa.api")

# Default: the Vite dev server. Override with a comma-separated list, e.g.
#   FINLUXA_CORS_ORIGINS=http://localhost:5173,https://app.example.com
_DEFAULT_CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"


def _cors_origins() -> list[str]:
    raw = os.environ.get("FINLUXA_CORS_ORIGINS", _DEFAULT_CORS_ORIGINS)
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="FinLuxa API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------
# Error handling: FinLuxaError -> HTTP status
# ------------------------------------------------------------------
_STATUS_BY_ERROR: dict[type[FinLuxaError], int] = {
    ValidationError: 422,
    DatabaseConnectionError: 503,
    QueryExecutionError: 500,
    RecordInsertionError: 500,
}

_GENERIC_MESSAGES: dict[int, str] = {
    503: "The service is temporarily unavailable. Please try again later.",
    500: "An internal error occurred.",
}


@app.exception_handler(FinLuxaError)
async def handle_finluxa_error(request: Request, exc: FinLuxaError) -> JSONResponse:
    status_code = _STATUS_BY_ERROR.get(type(exc), 500)

    if status_code == 422:
        # Validation messages are written for the end user, so they are safe to show.
        message = str(exc)
    else:
        # Database errors carry the raw SQL and driver details (see database.py).
        # Log them on the server, but never send them to the client.
        logger.error("%s on %s %s: %s", type(exc).__name__, request.method, request.url.path, exc)
        message = _GENERIC_MESSAGES[status_code]

    return JSONResponse(
        status_code=status_code,
        content={"error": type(exc).__name__, "detail": message},
    )


# ------------------------------------------------------------------
# Health check (does not touch the database)
# ------------------------------------------------------------------
@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
