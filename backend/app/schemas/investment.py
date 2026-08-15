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
    dips_per_month: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=31,
        description="Assumed average count of ~1% market falls per month (Pro+)",
    )
    amount_per_dip: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        description="Extra investment per 1% fall (INR)",
    )


class SipSummary(BaseModel):
    monthly_investment: Decimal
    annual_step_up_rate: Decimal
    dips_per_month: Decimal
    amount_per_dip: Decimal
    monthly_dip_investment: Decimal
    final_monthly_investment: Decimal
    total_dip_invested: Decimal
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
