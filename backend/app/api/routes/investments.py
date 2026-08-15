from fastapi import APIRouter

from app.schemas.investment import SipRequest, SipResponse
from app.services.investment_service import calculate_sip

router = APIRouter()


@router.post("/sip", response_model=SipResponse)
async def compute_sip(payload: SipRequest) -> SipResponse:
    return calculate_sip(payload)
