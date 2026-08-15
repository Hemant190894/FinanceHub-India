"""SIP and investment calculations."""

from decimal import Decimal, ROUND_HALF_UP

from app.schemas.investment import SipRequest, SipResponse, SipSummary, SipYearlyRow

MONEY = Decimal("0.01")


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def calculate_sip(payload: SipRequest) -> SipResponse:
    """Monthly SIP with optional annual step-up, annual lump sum, and monthly compounding."""
    months = payload.tenure_years * 12
    monthly = payload.monthly_investment
    monthly_rate = payload.annual_return_rate / Decimal(100) / Decimal(12)
    step_factor = Decimal(1) + payload.annual_step_up_rate / Decimal(100)

    yearly_rows: list[SipYearlyRow] = []
    corpus = Decimal(0)
    total_invested = Decimal(0)
    total_lump_sum = Decimal(0)

    for month in range(1, months + 1):
        if month > 1 and (month - 1) % 12 == 0:
            if payload.annual_step_up_rate > 0:
                monthly = _round_money(monthly * step_factor)
            if payload.annual_lump_sum > 0:
                corpus = (corpus * (1 + monthly_rate)) + payload.annual_lump_sum
                total_invested += payload.annual_lump_sum
                total_lump_sum += payload.annual_lump_sum

        corpus = (corpus * (1 + monthly_rate)) + monthly
        total_invested += monthly

        if month % 12 == 0 or month == months:
            year = (month + 11) // 12
            yearly_rows.append(
                SipYearlyRow(
                    year=year,
                    invested=_round_money(total_invested),
                    corpus=_round_money(corpus),
                    gains=_round_money(corpus - total_invested),
                )
            )

    maturity_value = _round_money(corpus)
    estimated_returns = _round_money(maturity_value - total_invested)

    return SipResponse(
        summary=SipSummary(
            monthly_investment=payload.monthly_investment,
            annual_step_up_rate=payload.annual_step_up_rate,
            annual_lump_sum=payload.annual_lump_sum,
            final_monthly_investment=_round_money(monthly),
            total_lump_sum_invested=_round_money(total_lump_sum),
            tenure_months=months,
            total_invested=_round_money(total_invested),
            estimated_returns=estimated_returns,
            maturity_value=maturity_value,
        ),
        yearly=yearly_rows,
    )
