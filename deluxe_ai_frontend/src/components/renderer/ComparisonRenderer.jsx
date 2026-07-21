"use client";

import { Scale } from "lucide-react";

import SummaryCard from "../cards/SummaryCard";
import ComparisonCard from "../cards/ComparisonCard";
import ActionButton from "../cards/ActionButton";

export default function ComparisonRenderer({ data = {}, actions = [] }) {
  const {
    summary,
    products = [],
    comparison = [],
    winner = {},
    recommendation = {},
  } = data;

  return (
    <div className="space-y-5">
      {summary && (
        <SummaryCard
          title="AI Product Comparison"
          summary={summary}
          icon={Scale}
        />
      )}

      {(products.length > 0 || comparison.length > 0) && (
        <ComparisonCard
          products={products}
          comparison={comparison}
          winner={winner}
          recommendation={recommendation}
        />
      )}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
