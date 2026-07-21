"use client";

import ProductDetailsCard from "../cards/ProductDetailsCard";
import ActionButton from "../cards/ActionButton";

export default function ProductDetailsRenderer({ data = {}, actions = [] }) {
  const product = data.product;

  if (!product) return null;

  const responseActions = actions.length > 0 ? actions : (data.actions ?? []);

  return (
    <div className="space-y-5">
      <ProductDetailsCard
        product={product}
        summary={data.summary}
        description={product.description}
        applications={product.applications}
        businessTypes={product.businessTypes}
        industries={product.industries}
        customerGoals={product.customerGoals}
        availableSizes={product.availableSizes}
        materials={product.materials}
        finishes={product.finishes}
        specifications={product.specifications}
        minimumOrder={product.minimumOrder}
        leadTime={product.leadTime}
        artworkRequired={product.artworkRequired}
        relatedProducts={product.relatedProducts}
        frequentlyBoughtWith={product.frequentlyBoughtWith}
      />

      {responseActions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {responseActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
