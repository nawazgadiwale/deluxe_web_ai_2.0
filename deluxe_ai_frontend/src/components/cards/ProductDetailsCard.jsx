"use client";

import {
  Package,
  Tag,
  FolderTree,
  FileText,
  CheckCircle2,
  Layers,
  Briefcase,
  Target,
  Building2,
  ShoppingBag,
  Ruler,
  Palette,
  Sparkles,
  Clock3,
  Hash,
  Image,
} from "lucide-react";

import RelatedProducts from "./RelatedProductCard";

function MetaChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-2">
      <span className="text-blue-600">{icon}</span>

      <span className="text-xs text-slate-500">{label}</span>

      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ChipList({ items = [], color = "blue" }) {
  if (!items?.length) return null;

  const colors = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`rounded-full px-3 py-2 text-sm font-medium ${colors[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ProductDetailsCard({
  product,
  summary,

  description,

  applications = [],

  businessTypes = [],
  industries = [],
  customerGoals = [],

  availableSizes = [],
  materials = [],
  finishes = [],

  specifications = {},

  minimumOrder,
  leadTime,
  artworkRequired,

  relatedProducts = [],
  frequentlyBoughtWith = [],
}) {
  if (!product) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Package size={30} />
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            {product.category && (
              <p className="mt-2 text-blue-100">{product.category}</p>
            )}

            {product.subCategory && (
              <p className="text-sm text-blue-200">{product.subCategory}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6">
        {/* Product Overview */}

        {summary && (
          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="mb-3 flex items-center gap-2 font-semibold">
              <FileText size={18} className="text-blue-600" />
              Product Overview
            </div>

            <p className="leading-7 text-slate-700">{summary}</p>
          </section>
        )}

        {/* Description */}

        {description && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <FileText size={18} className="text-blue-600" />
              Description
            </h2>

            <p className="leading-7 text-slate-600">{description}</p>
          </section>
        )}

        {/* Product Information */}

        <div className="flex flex-wrap gap-2">
          {product.category && (
            <MetaChip
              icon={<Tag size={14} />}
              label="Category"
              value={product.category}
            />
          )}

          {product.subCategory && (
            <MetaChip
              icon={<FolderTree size={14} />}
              label="Sub"
              value={product.subCategory}
            />
          )}

          {minimumOrder && (
            <MetaChip
              icon={<Hash size={14} />}
              label="MOQ"
              value={minimumOrder}
            />
          )}

          {leadTime && (
            <MetaChip
              icon={<Clock3 size={14} />}
              label="Lead"
              value={leadTime}
            />
          )}

          <MetaChip
            icon={<Image size={14} />}
            label="Artwork"
            value={artworkRequired ? "Required" : "No"}
          />
        </div>

        {/* Business Benefits */}

        {customerGoals.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Target size={18} className="text-green-600" />
              Business Benefits
            </h2>

            <ChipList items={customerGoals} color="green" />
          </section>
        )}

        {/* Best For */}

        {businessTypes.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Building2 size={18} className="text-purple-600" />
              Best For
            </h2>

            <ChipList items={businessTypes} color="purple" />
          </section>
        )}

        {/* Industries */}

        {industries.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Briefcase size={18} className="text-amber-600" />
              Industries
            </h2>

            <ChipList items={industries} color="amber" />
          </section>
        )}

        {/* Applications */}

        {applications.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <CheckCircle2 size={18} className="text-blue-600" />
              Applications
            </h2>

            <ChipList items={applications} color="blue" />
          </section>
        )}

        {/* Available Sizes */}

        {availableSizes.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Ruler size={18} className="text-indigo-600" />
              Available Sizes
            </h2>

            <ChipList items={availableSizes} color="indigo" />
          </section>
        )}

        {/* Materials */}

        {materials.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Palette size={18} className="text-green-600" />
              Materials
            </h2>

            <ChipList items={materials} color="green" />
          </section>
        )}

        {/* Finishing Options */}

        {finishes.length > 0 && (
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Sparkles size={18} className="text-amber-600" />
              Finishing Options
            </h2>

            <ChipList items={finishes} color="amber" />
          </section>
        )}

        {/* Specifications */}

        {Object.keys(specifications).length > 0 && (
          <section>
            <h2 className="mb-4 text-xl font-semibold">Specifications</h2>

            <div className="overflow-hidden rounded-2xl border">
              {Object.entries(specifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between border-b px-5 py-4 last:border-0"
                >
                  <span className="font-medium capitalize">{key}</span>

                  <span className="text-slate-600 text-right">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Frequently Bought Together */}

        {frequentlyBoughtWith.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <ShoppingBag size={18} className="text-blue-600" />
              Frequently Bought Together
            </div>

            <RelatedProducts title="" items={frequentlyBoughtWith} />
          </section>
        )}

        {/* Related Products */}

        {relatedProducts.length > 0 && (
          <section>
            <div className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Layers size={18} className="text-blue-600" />
              Related Products
            </div>

            <RelatedProducts title="" items={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
}
