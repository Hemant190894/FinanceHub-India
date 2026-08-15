from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api.routes import calculators, health, investments, loans
from app.core.config import settings

app = FastAPI(
    title="FinanceHub India API",
    description="Personal finance planning APIs for Indian users",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", include_in_schema=False)
async def root() -> RedirectResponse:
    """API root — send users to the web app, not a blank page."""
    return RedirectResponse(url=settings.frontend_url, status_code=307)


app.include_router(health.router, tags=["health"])
app.include_router(loans.router, prefix="/api/v1/loans", tags=["loans"])
app.include_router(investments.router, prefix="/api/v1/investments", tags=["investments"])
app.include_router(calculators.router, prefix="/api/v1/calculators", tags=["calculators"])
