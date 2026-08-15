"""Loan calculation service — wraps finance-engine logic."""

from decimal import Decimal, ROUND_HALF_UP

from app.schemas.loan import AmortizationResponse, AmortizationRow, EmiRequest, EmiResponse

MONEY = Decimal("0.01")


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def calculate_emi(principal: Decimal, annual_rate: Decimal, tenure_months: int) -> EmiResponse:
    """Standard reducing-balance EMI formula."""
    if annual_rate == 0:
        emi = principal / tenure_months
        return EmiResponse(
            monthly_emi=_round_money(emi),
            total_payment=_round_money(principal),
            total_interest=_round_money(Decimal(0)),
            tenure_months=tenure_months,
        )

    monthly_rate = annual_rate / Decimal(100) / Decimal(12)
    factor = (1 + monthly_rate) ** tenure_months
    emi = principal * monthly_rate * factor / (factor - 1)

    total_payment = emi * tenure_months
    return EmiResponse(
        monthly_emi=_round_money(emi),
        total_payment=_round_money(total_payment),
        total_interest=_round_money(total_payment - principal),
        tenure_months=tenure_months,
    )


def calculate_amortization(payload: EmiRequest) -> AmortizationResponse:
    summary = calculate_emi(payload.principal, payload.annual_interest_rate, payload.tenure_months)
    balance = payload.principal
    monthly_rate = payload.annual_interest_rate / Decimal(100) / Decimal(12)
    schedule: list[AmortizationRow] = []

    for month in range(1, payload.tenure_months + 1):
        interest = _round_money(balance * monthly_rate) if monthly_rate > 0 else Decimal(0)
        principal_component = _round_money(summary.monthly_emi - interest)
        if month == payload.tenure_months:
            principal_component = _round_money(balance)
            emi = _round_money(principal_component + interest)
            balance = Decimal(0)
        else:
            emi = summary.monthly_emi
            balance = _round_money(balance - principal_component)

        schedule.append(
            AmortizationRow(
                month=month,
                emi=emi,
                principal=principal_component,
                interest=interest,
                balance=balance,
            )
        )

    return AmortizationResponse(summary=summary, schedule=schedule)
