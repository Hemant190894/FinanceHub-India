from fastapi import APIRouter

from app.schemas.loan import AmortizationResponse, EmiRequest, EmiResponse
from app.services.loan_service import calculate_amortization, calculate_emi

router = APIRouter()


@router.post("/emi", response_model=EmiResponse)
async def compute_emi(payload: EmiRequest) -> EmiResponse:
    return calculate_emi(payload.principal, payload.annual_interest_rate, payload.tenure_months)


@router.post("/amortization", response_model=AmortizationResponse)
async def compute_amortization(payload: EmiRequest) -> AmortizationResponse:
    return calculate_amortization(payload)
