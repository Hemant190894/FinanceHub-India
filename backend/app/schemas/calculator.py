from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


class CalculatorResponse(BaseModel):
    summary: dict[str, Decimal]


class LumpsumRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)
    annual_return_rate: Decimal = Field(..., ge=0, le=100)
    tenure_years: int = Field(..., gt=0, le=50)


class SwpRequest(BaseModel):
    corpus: Decimal = Field(..., gt=0)
    monthly_withdrawal: Decimal = Field(..., gt=0)
    annual_return_rate: Decimal = Field(..., ge=0, le=100)
    tenure_years: int = Field(..., gt=0, le=50)


class MfReturnsRequest(BaseModel):
    initial_value: Decimal = Field(..., gt=0)
    final_value: Decimal = Field(..., gt=0)
    tenure_years: int = Field(..., gt=0, le=50)


class SsyRequest(BaseModel):
    yearly_deposit: Decimal = Field(..., gt=0, le=150000)
    annual_return_rate: Decimal = Field(default=Decimal("8.2"), ge=0, le=100)
    deposit_years: int = Field(default=15, gt=0, le=15)
    maturity_years: int = Field(default=21, gt=0, le=21)


class IncomeTaxRequest(BaseModel):
    gross_annual_income: Decimal = Field(..., gt=0)
    regime: Literal["new", "old"] = "new"
    deductions: Decimal = Field(default=Decimal("0"), ge=0)


class PpfRequest(BaseModel):
    yearly_deposit: Decimal = Field(..., gt=0, le=150000)
    annual_return_rate: Decimal = Field(default=Decimal("7.1"), ge=0, le=100)
    tenure_years: int = Field(default=15, gt=0, le=50)


class EpfRequest(BaseModel):
    monthly_basic: Decimal = Field(..., gt=0)
    employee_contribution_rate: Decimal = Field(default=Decimal("12"), ge=0, le=100)
    employer_contribution_rate: Decimal = Field(default=Decimal("12"), ge=0, le=100)
    annual_return_rate: Decimal = Field(default=Decimal("8.15"), ge=0, le=100)
    tenure_years: int = Field(..., gt=0, le=50)


class FdRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)
    annual_return_rate: Decimal = Field(..., ge=0, le=100)
    tenure_years: int = Field(..., gt=0, le=50)
    compounding_per_year: int = Field(default=4, ge=1, le=12)


class RdRequest(BaseModel):
    monthly_deposit: Decimal = Field(..., gt=0)
    annual_return_rate: Decimal = Field(..., ge=0, le=100)
    tenure_years: int = Field(..., gt=0, le=50)


class GstRequest(BaseModel):
    amount: Decimal = Field(..., gt=0)
    gst_rate: Decimal = Field(..., gt=0, le=100)
    mode: Literal["add", "remove"] = "add"


class CashFlow(BaseModel):
    amount: Decimal = Field(..., description="Negative = investment, positive = return")
    month: int = Field(..., ge=0, le=600)


class XirrRequest(BaseModel):
    cash_flows: list[CashFlow] = Field(..., min_length=2)
