import { LoanEmiPageContent } from "@/features/loan/loan-emi-page-content";

export const metadata = {
  title: "Home Loan EMI Calculator | FinanceHub India",
  description: "Calculate home loan EMI, total interest, and repayment.",
};

export default function HomeLoanEmiPage() {
  return <LoanEmiPageContent loanType="home" />;
}
