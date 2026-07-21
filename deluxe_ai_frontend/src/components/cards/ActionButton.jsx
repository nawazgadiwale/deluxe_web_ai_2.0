"use client";

import {
  ArrowRight,
  ShoppingCart,
  Phone,
  FileText,
  Scale,
  RotateCcw,
  XCircle,
  PlusCircle,
  CheckCircle2,
  ClipboardList,
  Pencil,
  LoaderCircle,
  Package,
} from "lucide-react";

import { useChatContext } from "../../context/ChatContext";

const ACTION_CONFIG = {
  /*
   * =====================================================
   * Product
   * =====================================================
   */

  SHOW_PRODUCT_DETAILS: {
    icon: ArrowRight,
    variant: "secondary",
  },

  COMPARE_PRODUCT: {
    icon: Scale,
    variant: "secondary",
  },

  COMPARE_PRODUCTS: {
    icon: Scale,
    variant: "secondary",
  },

  /*
   * =====================================================
   * Recommendation
   * =====================================================
   */

  START_ORDER: {
    icon: ShoppingCart,
    variant: "primary",
  },

  REQUEST_QUOTE: {
    icon: FileText,
    variant: "primary",
  },

  GET_QUOTE: {
    icon: FileText,
    variant: "primary",
  },

  CONTACT_SALES: {
    icon: Phone,
    variant: "secondary",
  },

  /*
   * =====================================================
   * Workflow
   * =====================================================
   */

  RESUME_WORKFLOW: {
    icon: RotateCcw,
    variant: "primary",
  },

  CANCEL_WORKFLOW: {
    icon: XCircle,
    variant: "danger",
  },

  /*
   * =====================================================
   * Order
   * =====================================================
   */

  ADD_RELATED_PRODUCT: {
    icon: PlusCircle,
    variant: "primary",
  },

  CONTINUE_ORDER: {
    icon: ArrowRight,
    variant: "secondary",
  },

  ADD_MORE_ITEMS: {
    icon: Package,
    variant: "secondary",
  },

  REVIEW_ORDER: {
    icon: ClipboardList,
    variant: "primary",
  },

  CONFIRM_ORDER: {
    icon: CheckCircle2,
    variant: "success",
  },

  EDIT_ORDER: {
    icon: Pencil,
    variant: "secondary",
  },

  CANCEL_ORDER: {
    icon: XCircle,
    variant: "danger",
  },
};

const BUTTON_STYLES = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow hover:shadow-lg",

  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-blue-300",

  success: "bg-green-600 text-white hover:bg-green-700 shadow",

  danger: "bg-red-600 text-white hover:bg-red-700 shadow",
};

export default function ActionButton({ action, formData, order }) {
  const { loading, handleAction } = useChatContext();

  if (!action) return null;

  const config = ACTION_CONFIG[action.id] ?? {
    icon: ArrowRight,
    variant: "secondary",
  };

  const Icon = config.icon;

  const submitAction = {
    ...action,

    /*
     * IMPORTANT:
     * Preserve the original payload and merge any
     * form/order data into it.
     */
    payload: {
      ...(action.payload ?? {}),
      ...(formData ?? {}),
      ...(order?._id ? { orderId: order._id } : {}),
    },
  };

  return (
    <button
      disabled={loading}
      onClick={() => {
        console.log("========== ACTION BUTTON ==========");
        console.dir(action, { depth: null });

        console.log("========== SUBMIT ACTION ==========");
        console.dir(submitAction, { depth: null });

        handleAction(submitAction);
      }}
      className={`
        flex
        items-center
        justify-center
        gap-2

        rounded-2xl

        px-5
        py-3

        text-sm
        font-medium

        transition-all
        duration-200

        ${BUTTON_STYLES[config.variant]}

        disabled:opacity-50
        disabled:cursor-not-allowed
      `}
    >
      {loading ? (
        <LoaderCircle size={18} className="animate-spin" />
      ) : (
        <Icon size={18} />
      )}

      {action.label}
    </button>
  );
}
