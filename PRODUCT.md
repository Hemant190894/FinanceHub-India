# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Frontend: Next.js 16 (React 19, TypeScript), Tailwind CSS 4, shadcn/ui, Recharts, next-themes.
Backend (planned): Python, FastAPI, Pydantic, SQLAlchemy, Alembic, PostgreSQL.
Calculation logic lives in a standalone `packages/finance-engine` shared across web, future mobile apps, and backend APIs — the frontend must not duplicate financial formulas.

## Users

Primary users are Indian retail borrowers and investors broadly — no single segment (e.g. only first-time home buyers, or only salaried professionals) has been chosen to design for first. The product should read as accessible to a general Indian audience evaluating loans and investment decisions, not narrowly tailored to one persona.

## Product Purpose

A personal financial planning platform for India that turns raw financial calculations (EMI, eligibility, affordability, investment growth) into understandable decisions. It goes beyond a single-answer calculator by showing multiple scenarios side-by-side so a user can reason about trade-offs before acting.

## Positioning

Most calculators stop at "here is your EMI." FinanceHub India's mechanism is scenario comparison: normal EMI vs. extra annual EMI vs. step-up EMI vs. invest-the-difference, evaluated together with a documented affordability score, so the product answers "what should I understand from this?" rather than just producing a number.

## Operating Context

- First major module: Home Loan Planner (eligibility, EMI, amortization, affordability, tenure comparison, prepayment vs. investment).
- Users adjust inputs (income, EMI, tenure, rate, extra payment amount) and expect charts/results to update immediately.
- Assumptions that drive scenarios (e.g. 12% illustrative investment return, 10% annual EMI step-up) must always be visible and editable, never hidden defaults.
- Output is expected to eventually include a downloadable PDF report combining inputs, scenarios, charts, and disclaimers.
- Planned ecosystem grows into Investments (SIP, lumpsum, SWP, goal-based) and Wealth Planning (retirement, net worth, financial independence) calculators beyond the initial loan focus.

## Capabilities and Constraints

- Calculation engine (`packages/finance-engine`) must remain deterministic, testable, and independent of UI/presentation — no financial formulas embedded directly in components.
- Loan eligibility is an approximate range, never presented as a guaranteed bank sanction.
- Investment return assumptions (e.g. 12% p.a.) are illustrative, not guaranteed, and must be labeled as assumptions.
- Affordability meter (🟢/🟡/🔴) must be driven by a documented scoring methodology (`docs/calculations/AFFORDABILITY_SCORE.md`), not an arbitrary single ratio, and the UI must explain *why* a status was assigned.
- AI (future) may explain results or translate natural-language questions into calculator inputs, but must never invent numbers or override the deterministic calculation engine.
- Primary platform is web first; architecture should not preclude a future native mobile app sharing the same backend/finance engine (this does not make the current platform "adaptive" — see Platform above).
- Financial data sensitivity: never commit secrets, validate all API input, least-privilege on authenticated endpoints, avoid storing unnecessary personal information.

## Brand Commitments

- Design direction is explicitly pinned by the README: premium feel like CRED, simple/functional navigation like Zerodha, minimal product-focused interface like Linear — combined into an original visual identity that does not copy any of the three companies' branding, proprietary UI, or assets.
- Product name: FinanceHub India.

## Evidence on Hand

No real logos, brand assets, testimonials, case studies, or production content exist yet (`assets/` is currently empty; wireframes exist under `design/wireframes/` for Dashboard, EMI Calculator, and Home Page). Future work must not fabricate brand assets, customer evidence, or benchmarks — treat their absence as a known gap, not something to invent.

## Product Principles

- Explain, don't overwhelm — every important result must be understandable to a non-expert user.
- Always show scenario comparisons, not a single isolated answer.
- Assumptions (rates, returns, inflation) are always visible and editable, never buried.
- No false certainty — never present estimates as guaranteed approvals or guaranteed returns.
- Every result should answer "so what should I understand from this?"

## Accessibility & Inclusion

No formal compliance standard (e.g. WCAG AA) is required at this stage. Follow general best practice: solid color contrast, keyboard navigation, and semantic HTML by default. The product should also feel fast and usable on typical Indian mobile network conditions, not only on high-end connections.
