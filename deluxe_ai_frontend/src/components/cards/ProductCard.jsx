"use client";

import { Package, Star, Sparkles, Layers, ArrowRight } from "lucide-react";

import ActionButton from "./ActionButton";

export default function ProductCard({ product }) {
  if (!product) return null;

  const confidence =
    typeof product.score === "number"
      ? product.score > 1
        ? product.score
        : Math.round(product.score * 100)
      : null;

  const suggestions = product.frequentlyBoughtWith?.length
    ? product.frequentlyBoughtWith
    : (product.relatedProducts ?? []);

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-300
        hover:shadow-xl
      "
    >
      {/* ================= Header ================= */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-100
          bg-gradient-to-r
          from-blue-50
          to-white
          px-5
          py-4
        "
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
            <Package className="text-blue-600" size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">{product.product}</h3>

            <p className="text-xs text-slate-500">AI Recommended Product</p>
          </div>
        </div>

        {confidence && (
          <div
            className="
              flex
              items-center
              gap-1
              rounded-full
              bg-green-100
              px-3
              py-1
              text-xs
              font-semibold
              text-green-700
            "
          >
            <Star size={13} />
            {confidence}%
          </div>
        )}
      </div>

      {/* ================= Summary ================= */}

      {product.summary && (
        <div className="px-5 pt-5">
          <p className="leading-7 text-slate-600">{product.summary}</p>
        </div>
      )}

      {/* ================= Reason ================= */}

      {product.reason && (
        <div className="px-5 pt-5">
          <div
            className="
              rounded-2xl
              border
              border-blue-100
              bg-blue-50
              p-4
            "
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-blue-600" />

              <span className="font-medium">Why AI recommends this</span>
            </div>

            <p className="text-sm leading-7 text-slate-600">{product.reason}</p>
          </div>
        </div>
      )}

      {/* ================= Suggested Products ================= */}

      {suggestions.length > 0 && (
        <div className="px-5 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />

            <span className="font-medium">Frequently Ordered Together</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 6).map((item) => (
              <span
                key={item}
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1
                  text-xs
                  text-slate-700
                "
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= Retrieval ================= */}

      {(product.retrievalMethods ?? []).length > 0 && (
        <div className="px-5 pt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Matched Using
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {product.retrievalMethods.map((method) => (
              <span
                key={method}
                className="
                  rounded-full
                  border
                  border-slate-200
                  px-3
                  py-1
                  text-xs
                  text-slate-500
                "
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= Actions ================= */}

      {(product.actions ?? []).length > 0 && (
        <div
          className="
            mt-6
            flex
            flex-wrap
            gap-3
            border-t
            border-slate-100
            px-5
            py-5
          "
        >
          {product.actions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}
