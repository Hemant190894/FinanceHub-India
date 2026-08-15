from decimal import Decimal

import pytest

from app.schemas.investment import SipRequest
from app.services.investment_service import calculate_sip


def test_sip_zero_return() -> None:
    result = calculate_sip(
        SipRequest(monthly_investment=Decimal("10000"), annual_return_rate=Decimal("0"), tenure_years=1)
    )
    assert result.summary.total_invested == Decimal("120000.00")
    assert result.summary.maturity_value == Decimal("120000.00")
    assert result.summary.estimated_returns == Decimal("0.00")


def test_sip_positive_return() -> None:
    result = calculate_sip(
        SipRequest(monthly_investment=Decimal("10000"), annual_return_rate=Decimal("12"), tenure_years=10)
    )
    assert result.summary.maturity_value > result.summary.total_invested
    assert result.summary.total_invested == Decimal("1200000.00")


def test_step_up_increases_investment() -> None:
    flat = calculate_sip(
        SipRequest(monthly_investment=Decimal("10000"), annual_return_rate=Decimal("12"), tenure_years=5)
    )
    stepped = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=5,
            annual_step_up_rate=Decimal("10"),
        )
    )
    assert stepped.summary.total_invested > flat.summary.total_invested
    assert stepped.summary.final_monthly_investment == Decimal("14641.00")


def test_step_up_zero_matches_flat() -> None:
    flat = calculate_sip(
        SipRequest(monthly_investment=Decimal("10000"), annual_return_rate=Decimal("12"), tenure_years=3)
    )
    explicit = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=3,
            annual_step_up_rate=Decimal("0"),
        )
    )
    assert flat.summary.maturity_value == explicit.summary.maturity_value
    assert flat.summary.total_invested == explicit.summary.total_invested


def test_pro_plus_lump_sum_increases_corpus() -> None:
    stepped = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=5,
            annual_step_up_rate=Decimal("10"),
        )
    )
    pro_plus = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=5,
            annual_step_up_rate=Decimal("10"),
            annual_lump_sum=Decimal("50000"),
        )
    )
    assert pro_plus.summary.total_lump_sum_invested == Decimal("200000.00")
    assert pro_plus.summary.maturity_value > stepped.summary.maturity_value
    assert pro_plus.summary.total_invested > stepped.summary.total_invested
