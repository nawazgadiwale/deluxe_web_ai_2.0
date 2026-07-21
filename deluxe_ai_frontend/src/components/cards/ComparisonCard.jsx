"use client";

import {
  Scale,
  Tag,
  FolderTree,
  FileText,
  Layers,
  Trophy,
  Sparkles,
} from "lucide-react";

export default function ComparisonCard({
  products = [],
  comparison = [],
  winner = {},
  recommendation = {},
}) {
  if (!products.length) return null;

  return (
    <div className="space-y-6">
      {/* ======================================
          AI Recommendation
      ====================================== */}

      {winner?.product && (
        <div className="overflow-hidden rounded-3xl border border-green-200 bg-green-50 shadow-sm">
          <div className="flex items-center gap-3 border-b border-green-200 bg-white px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
              <Trophy className="text-green-700" size={22} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-green-800">
                AI Recommendation
              </h2>

              <p className="text-sm text-green-600">
                Best choice based on your business objective
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="rounded-2xl border border-green-300 bg-white p-5">
              <div className="text-sm font-semibold uppercase tracking-wide text-green-600">
                Recommended Product
              </div>

              <div className="mt-2 text-3xl font-bold text-slate-900">
                {winner.product}
              </div>

              {winner.reason && (
                <p className="mt-4 leading-7 text-slate-700">{winner.reason}</p>
              )}
            </div>

            {recommendation?.message && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-indigo-600" />

                  <h3 className="font-semibold text-slate-900">
                    Why this recommendation?
                  </h3>
                </div>

                <p className="leading-8 text-slate-700">
                  {recommendation.message}
                </p>
              </div>
            )}

            {recommendation?.alternative && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <h3 className="font-semibold text-amber-700">
                  When is the other product a better choice?
                </h3>

                <p className="mt-3 leading-8 text-slate-700">
                  {recommendation.alternative}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================
          Comparison Highlights
      ====================================== */}

      {comparison.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold">Comparison Highlights</h2>
          </div>

          <div className="space-y-5 p-6">
            {comparison.map((item) => (
              <div
                key={item.attribute}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <h3 className="font-semibold text-slate-900">
                  {item.attribute}
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      {products[0]?.name}
                    </div>

                    <div className="mt-2 text-sm text-slate-700">
                      {item.product1}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      {products[1]?.name}
                    </div>

                    <div className="mt-2 text-sm text-slate-700">
                      {item.product2}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================
          Product Details
      ====================================== */}

      {products.map((product, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white px-5 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">
              <Scale size={22} className="text-indigo-600" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">{product.name}</h3>

              <p className="text-xs text-slate-500">Comparison Candidate</p>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Tag size={16} className="text-blue-600" />
                  <span className="font-medium">Category</span>
                </div>

                <p className="text-sm text-slate-600">{product.category}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FolderTree size={16} className="text-blue-600" />
                  <span className="font-medium">Sub Category</span>
                </div>

                <p className="text-sm text-slate-600">{product.subCategory}</p>
              </div>
            </div>

            {product.description && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="font-medium">Description</span>
                </div>

                <p className="text-sm leading-7 text-slate-600">
                  {product.description}
                </p>
              </div>
            )}

            {(product.applications ?? []).length > 0 && (
              <div>
                <div className="mb-3 font-medium">Applications</div>

                <div className="flex flex-wrap gap-2">
                  {product.applications.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(product.relatedProducts ?? []).length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Layers size={16} className="text-blue-600" />
                  <span className="font-medium">Related Products</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {product.relatedProducts.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
