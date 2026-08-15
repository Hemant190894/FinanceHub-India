from decimal import Decimal

from app.schemas.calculator import (
    CashFlow,
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


def test_lumpsum() -> None:
    result = calculate_lumpsum(
        LumpsumRequest(amount=Decimal("100000"), annual_return_rate=Decimal("12"), tenure_years=5)
    )
    assert result.summary["maturity_value"] > result.summary["total_invested"]


def test_gst_add() -> None:
    result = calculate_gst(GstRequest(amount=Decimal("1000"), gst_rate=Decimal("18"), mode="add"))
    assert result.summary["gst_amount"] == Decimal("180.00")
    assert result.summary["total_amount"] == Decimal("1180.00")


def test_xirr_simple() -> None:
    result = calculate_xirr(
        XirrRequest(
            cash_flows=[
                CashFlow(amount=Decimal("-10000"), month=0),
                CashFlow(amount=Decimal("12100"), month=12),
            ]
        )
    )
    assert result.summary["xirr_percent"] > Decimal("20")


def test_income_tax_new_regime() -> None:
    result = calculate_income_tax(
        IncomeTaxRequest(gross_annual_income=Decimal("1200000"), regime="new")
    )
    assert result.summary["total_tax"] > Decimal(0)
