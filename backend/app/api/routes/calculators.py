from fastapi import APIRouter

from app.schemas.calculator import (
    CalculatorResponse,
    EpfRequest,
    FdRequest,
    GstRequest,
    IncomeTaxRequest,
    LumpsumRequest,
    MfReturnsRequest,
    PpfRequest,
    RdRequest,
    SsyRequest,
    SwpRequest,
    XirrRequest,
)
from app.services.calculator_service import (
    calculate_epf,
    calculate_fd,
    calculate_gst,
    calculate_income_tax,
    calculate_lumpsum,
    calculate_mf_returns,
    calculate_ppf,
    calculate_rd,
    calculate_ssy,
    calculate_swp,
    calculate_xirr,
)

router = APIRouter()


@router.post("/lumpsum", response_model=CalculatorResponse)
async def compute_lumpsum(payload: LumpsumRequest) -> CalculatorResponse:
    return calculate_lumpsum(payload)


@router.post("/swp", response_model=CalculatorResponse)
async def compute_swp(payload: SwpRequest) -> CalculatorResponse:
    return calculate_swp(payload)


@router.post("/mf-returns", response_model=CalculatorResponse)
async def compute_mf_returns(payload: MfReturnsRequest) -> CalculatorResponse:
    return calculate_mf_returns(payload)


@router.post("/ssy", response_model=CalculatorResponse)
async def compute_ssy(payload: SsyRequest) -> CalculatorResponse:
    return calculate_ssy(payload)


@router.post("/income-tax", response_model=CalculatorResponse)
async def compute_income_tax(payload: IncomeTaxRequest) -> CalculatorResponse:
    return calculate_income_tax(payload)


@router.post("/ppf", response_model=CalculatorResponse)
async def compute_ppf(payload: PpfRequest) -> CalculatorResponse:
    return calculate_ppf(payload)


@router.post("/epf", response_model=CalculatorResponse)
async def compute_epf(payload: EpfRequest) -> CalculatorResponse:
    return calculate_epf(payload)


@router.post("/fd", response_model=CalculatorResponse)
async def compute_fd(payload: FdRequest) -> CalculatorResponse:
    return calculate_fd(payload)


@router.post("/rd", response_model=CalculatorResponse)
async def compute_rd(payload: RdRequest) -> CalculatorResponse:
    return calculate_rd(payload)


@router.post("/gst", response_model=CalculatorResponse)
async def compute_gst(payload: GstRequest) -> CalculatorResponse:
    return calculate_gst(payload)


@router.post("/xirr", response_model=CalculatorResponse)
async def compute_xirr(payload: XirrRequest) -> CalculatorResponse:
    return calculate_xirr(payload)
