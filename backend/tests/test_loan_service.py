from decimal import Decimal

import pytest

from app.services.loan_service import calculate_emi


def test_emi_zero_interest() -> None:
    result = calculate_emi(Decimal("1200000"), Decimal("0"), 120)
    assert result.monthly_emi == Decimal("10000.00")
    assert result.total_interest == Decimal("0.00")


def test_emi_standard_home_loan() -> None:
    # ₹50L @ 8.5% for 20 years — sanity check against known ballpark
    result = calculate_emi(Decimal("5000000"), Decimal("8.5"), 240)
    assert result.monthly_emi == Decimal("43391.16")
    assert result.total_interest > Decimal("5000000")
