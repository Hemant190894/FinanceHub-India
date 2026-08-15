from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class EmiRequest(BaseModel):
    principal: Decimal = Field(..., gt=0, description="Loan amount in INR")
    annual_interest_rate: Decimal = Field(..., ge=0, le=100, description="Annual interest rate %")
    tenure_months: int = Field(..., gt=0, le=600, description="Loan tenure in months")


class EmiResponse(BaseModel):
    monthly_emi: Decimal
    total_payment: Decimal
    total_interest: Decimal
    tenure_months: int


class AmortizationRow(BaseModel):
    month: int
    emi: Decimal
    principal: Decimal
    interest: Decimal
    balance: Decimal


class AmortizationResponse(BaseModel):
    summary: EmiResponse
    schedule: list[AmortizationRow]
