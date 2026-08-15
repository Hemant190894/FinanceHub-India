import { LoanEmiPageContent } from "@/features/loan/loan-emi-page-content";

export const metadata = {
  title: "Car Loan EMI Calculator | FinanceHub India",
  description: "Calculate car loan EMI with your own amount, rate and tenure.",
};

export default function CarLoanEmiPage() {
  return <LoanEmiPageContent loanType="car" />;
}
