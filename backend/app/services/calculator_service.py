"""Investment, tax and savings calculators — standard formulas, illustrative only."""

from decimal import Decimal, ROUND_HALF_UP

from app.schemas.calculator import (
    CalculatorResponse,
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

MONEY = Decimal("0.01")
PCT = Decimal("0.0001")


def _money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)


def _pct(value: Decimal) -> Decimal:
    return value.quantize(PCT, rounding=ROUND_HALF_UP)


def _summary(**kwargs: Decimal) -> CalculatorResponse:
    return CalculatorResponse(summary={k: _money(v) for k, v in kwargs.items()})


def calculate_lumpsum(payload: LumpsumRequest) -> CalculatorResponse:
    rate = payload.annual_return_rate / Decimal(100)
    maturity = payload.amount * (1 + rate) ** payload.tenure_years
    returns = maturity - payload.amount
    return _summary(
        maturity_value=maturity,
        total_invested=payload.amount,
        estimated_returns=returns,
    )


def calculate_swp(payload: SwpRequest) -> CalculatorResponse:
    months = payload.tenure_years * 12
    monthly_rate = payload.annual_return_rate / Decimal(100) / Decimal(12)
    balance = payload.corpus
    withdrawn = Decimal(0)
    months_run = 0

    for month in range(1, months + 1):
        balance = balance * (1 + monthly_rate) - payload.monthly_withdrawal
        withdrawn += payload.monthly_withdrawal
        months_run = month
        if balance <= 0:
            balance = Decimal(0)
            break

    return _summary(
        remaining_corpus=balance,
        total_withdrawn=withdrawn,
        months_sustained=Decimal(months_run),
        corpus_depleted=Decimal(1) if balance <= 0 else Decimal(0),
    )


def calculate_mf_returns(payload: MfReturnsRequest) -> CalculatorResponse:
    years = payload.tenure_years
    if years <= 0:
        cagr = Decimal(0)
    else:
        cagr = (payload.final_value / payload.initial_value) ** (Decimal(1) / years) - Decimal(1)
    absolute_return = payload.final_value - payload.initial_value
    return _summary(
        cagr_percent=cagr * Decimal(100),
        absolute_return=absolute_return,
        initial_value=payload.initial_value,
        final_value=payload.final_value,
    )


def calculate_ssy(payload: SsyRequest) -> CalculatorResponse:
    rate = payload.annual_return_rate / Decimal(100)
    deposit_years = min(payload.deposit_years, payload.maturity_years)
    balance = Decimal(0)
    total = Decimal(0)

    for year in range(1, payload.maturity_years + 1):
        if year <= deposit_years:
            balance += payload.yearly_deposit
            total += payload.yearly_deposit
        balance *= Decimal(1) + rate

    returns = balance - total
    return _summary(
        maturity_value=balance,
        total_invested=total,
        estimated_returns=returns,
    )


def _tax_new_regime(taxable: Decimal) -> Decimal:
    if taxable <= 0:
        return Decimal(0)
    slabs = [
        (Decimal("300000"), Decimal("0")),
        (Decimal("700000"), Decimal("0.05")),
        (Decimal("1000000"), Decimal("0.10")),
        (Decimal("1200000"), Decimal("0.15")),
        (Decimal("1500000"), Decimal("0.20")),
    ]
    tax = Decimal(0)
    prev = Decimal(0)
    for limit, rate in slabs:
        if taxable <= prev:
            break
        band = min(taxable, limit) - prev
        tax += band * rate
        prev = limit
    if taxable > Decimal("1500000"):
        tax += (taxable - Decimal("1500000")) * Decimal("0.30")
    return tax


def _tax_old_regime(taxable: Decimal) -> Decimal:
    if taxable <= 0:
        return Decimal(0)
    slabs = [
        (Decimal("250000"), Decimal("0")),
        (Decimal("500000"), Decimal("0.05")),
        (Decimal("1000000"), Decimal("0.20")),
    ]
    tax = Decimal(0)
    prev = Decimal(0)
    for limit, rate in slabs:
        if taxable <= prev:
            break
        band = min(taxable, limit) - prev
        tax += band * rate
        prev = limit
    if taxable > Decimal("1000000"):
        tax += (taxable - Decimal("1000000")) * Decimal("0.30")
    return tax


def calculate_income_tax(payload: IncomeTaxRequest) -> CalculatorResponse:
    gross = payload.gross_annual_income
    if payload.regime == "new":
        taxable = gross - Decimal("75000")
        base_tax = _tax_new_regime(taxable)
    else:
        taxable = gross - payload.deductions
        base_tax = _tax_old_regime(taxable)

    cess = base_tax * Decimal("0.04")
    total_tax = base_tax + cess
    effective = (total_tax / gross * Decimal(100)) if gross > 0 else Decimal(0)

    return _summary(
        taxable_income=max(taxable, Decimal(0)),
        income_tax=base_tax,
        cess=cess,
        total_tax=total_tax,
        effective_tax_rate=effective,
    )


def calculate_ppf(payload: PpfRequest) -> CalculatorResponse:
    rate = payload.annual_return_rate / Decimal(100)
    balance = Decimal(0)
    total = Decimal(0)
    for _ in range(payload.tenure_years):
        balance = (balance + payload.yearly_deposit) * (Decimal(1) + rate)
        total += payload.yearly_deposit
    returns = balance - total
    return _summary(
        maturity_value=balance,
        total_invested=total,
        estimated_returns=returns,
    )


def calculate_epf(payload: EpfRequest) -> CalculatorResponse:
    monthly_contrib = payload.monthly_basic * (
        payload.employee_contribution_rate + payload.employer_contribution_rate
    ) / Decimal(100)
    months = payload.tenure_years * 12
    monthly_rate = payload.annual_return_rate / Decimal(100) / Decimal(12)
    balance = Decimal(0)
    for _ in range(months):
        balance = (balance + monthly_contrib) * (Decimal(1) + monthly_rate)
    total = monthly_contrib * months
    returns = balance - total
    return _summary(
        maturity_value=balance,
        total_contributed=total,
        estimated_returns=returns,
        monthly_contribution=monthly_contrib,
    )


def calculate_fd(payload: FdRequest) -> CalculatorResponse:
    n = payload.compounding_per_year
    rate = payload.annual_return_rate / Decimal(100)
    maturity = payload.amount * (Decimal(1) + rate / n) ** (n * payload.tenure_years)
    interest = maturity - payload.amount
    return _summary(
        maturity_value=maturity,
        principal=payload.amount,
        interest_earned=interest,
    )


def calculate_rd(payload: RdRequest) -> CalculatorResponse:
    months = payload.tenure_years * 12
    monthly_rate = payload.annual_return_rate / Decimal(100) / Decimal(12)
    balance = Decimal(0)
    total = Decimal(0)
    for _ in range(months):
        balance = (balance + payload.monthly_deposit) * (Decimal(1) + monthly_rate)
        total += payload.monthly_deposit
    returns = balance - total
    return _summary(
        maturity_value=balance,
        total_deposited=total,
        estimated_returns=returns,
    )


def calculate_gst(payload: GstRequest) -> CalculatorResponse:
    rate = payload.gst_rate / Decimal(100)
    if payload.mode == "add":
        base = payload.amount
        gst_amount = base * rate
        total = base + gst_amount
    else:
        total = payload.amount
        base = total / (Decimal(1) + rate)
        gst_amount = total - base
    return _summary(
        base_amount=base,
        gst_amount=gst_amount,
        total_amount=total,
    )


def _xirr_npv(rate: Decimal, flows: list[CashFlow]) -> Decimal:
    total = Decimal(0)
    for flow in flows:
        years = Decimal(flow.month) / Decimal(12)
        total += flow.amount / (Decimal(1) + rate) ** years
    return total


def _xirr_dnpv(rate: Decimal, flows: list[CashFlow]) -> Decimal:
    total = Decimal(0)
    for flow in flows:
        years = Decimal(flow.month) / Decimal(12)
        total += -flow.amount * years / (Decimal(1) + rate) ** (years + Decimal(1))
    return total


def calculate_xirr(payload: XirrRequest) -> CalculatorResponse:
    rate = Decimal("0.10")
    for _ in range(50):
        npv = _xirr_npv(rate, payload.cash_flows)
        dnpv = _xirr_dnpv(rate, payload.cash_flows)
        if abs(dnpv) < Decimal("1e-12"):
            break
        rate = rate - npv / dnpv
    return _summary(xirr_percent=rate * Decimal(100))

