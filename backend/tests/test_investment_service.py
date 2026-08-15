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


def test_pro_plus_dip_buying() -> None:
    base = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=2,
        )
    )
    with_dips = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=2,
            dips_per_month=Decimal("2"),
            amount_per_dip=Decimal("2000"),
        )
    )
    assert with_dips.summary.monthly_dip_investment == Decimal("4000.00")
    assert with_dips.summary.total_dip_invested == Decimal("96000.00")
    assert with_dips.summary.maturity_value > base.summary.maturity_value


def test_pro_plus_step_up_and_dips() -> None:
    result = calculate_sip(
        SipRequest(
            monthly_investment=Decimal("10000"),
            annual_return_rate=Decimal("12"),
            tenure_years=3,
            annual_step_up_rate=Decimal("10"),
            dips_per_month=Decimal("1"),
            amount_per_dip=Decimal("1000"),
        )
    )
    assert result.summary.annual_step_up_rate == Decimal("10")
    assert result.summary.total_dip_invested == Decimal("36000.00")
