from decimal import Decimal

from pydantic import BaseModel, Field


class SipRequest(BaseModel):
    monthly_investment: Decimal = Field(..., gt=0, description="Monthly SIP amount in INR")
    annual_return_rate: Decimal = Field(..., ge=0, le=100, description="Expected annual return %")
    tenure_years: int = Field(..., gt=0, le=50, description="Investment tenure in years")
    annual_step_up_rate: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=100,
        description="Annual increase in monthly SIP (%) at the start of each new year",
    )


class SipSummary(BaseModel):
    monthly_investment: Decimal
    annual_step_up_rate: Decimal
    final_monthly_investment: Decimal
    tenure_months: int
    total_invested: Decimal
    estimated_returns: Decimal
    maturity_value: Decimal


class SipYearlyRow(BaseModel):
    year: int
    invested: Decimal
    corpus: Decimal
    gains: Decimal


class SipResponse(BaseModel):
    summary: SipSummary
    yearly: list[SipYearlyRow]
