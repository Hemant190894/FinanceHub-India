import { LoanEmiPageContent } from "@/features/loan/loan-emi-page-content";

export const metadata = {
  title: "Personal Loan EMI Calculator | FinanceHub India",
  description: "Calculate personal loan EMI with your own amount, rate and tenure.",
};

export default function PersonalLoanEmiPage() {
  return <LoanEmiPageContent loanType="personal" />;
}
