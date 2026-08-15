import { notFound } from "next/navigation";

import { GenericCalculatorPageContent } from "@/features/calculator/generic-calculator-page-content";
import { CALCULATOR_BY_SLUG } from "@/lib/calculators/registry";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return Object.keys(CALCULATOR_BY_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const config = CALCULATOR_BY_SLUG[slug];
  if (!config) return { title: "Calculator | FinanceHub India" };
  return {
    title: `${slug.replace(/-/g, " ")} | FinanceHub India`,
    description: "Illustrative finance calculator for planning — not advice.",
  };
}

export default async function DynamicCalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const config = CALCULATOR_BY_SLUG[slug];
  if (!config) notFound();
  return <GenericCalculatorPageContent slug={slug} />;
}
