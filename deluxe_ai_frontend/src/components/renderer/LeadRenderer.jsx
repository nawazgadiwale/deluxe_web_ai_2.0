"use client";

import LeadCard from "../cards/LeadCard";

export default function LeadRenderer({
  data = {},
  message = "",
  actions = [],
}) {
  if (!data) {
    return null;
  }

  return (
    <LeadCard
      /* =========================================
         Workflow
      ========================================= */

      step={data.step}
      question={data.question}
      message={message || data.message || data.summary}
      /* =========================================
         Customer
      ========================================= */

      customer={data.customer ?? null}
      assignedTo={data.assignedTo ?? null}
      /* =========================================
         Validation
      ========================================= */

      missingFields={data.missingFields ?? []}
      errors={data.errors ?? []}
      /* =========================================
         Follow Up
      ========================================= */

      followUpQuestion={data.followUpQuestion}
      /* =========================================
         Actions
      ========================================= */

      actions={actions.length ? actions : (data.actions ?? [])}
      metadata={data.metadata ?? {}}
    />
  );
}
