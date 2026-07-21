"use client";

import OrderCard from "../cards/OrderCard";

export default function OrderRenderer({
  data = {},
  message = "",
  actions = [],
}) {
  if (!data) {
    return null;
  }

  const form = data.forms?.[0] ?? null;

  return (
    <OrderCard
      /* Message */
      message={message}
      /* Form */
      form={form}
      /* Order */
      items={data.items ?? []}
      customer={data.customer ?? null}
      order={data.order ?? null}
      /* Validation */
      errors={data.errors ?? []}
      /* Recommendations */
      recommendations={data.recommendations ?? []}
      /* Actions */
      actions={actions.length ? actions : (form?.actions ?? data.actions ?? [])}
      metadata={data.metadata ?? {}}
    />
  );
}
