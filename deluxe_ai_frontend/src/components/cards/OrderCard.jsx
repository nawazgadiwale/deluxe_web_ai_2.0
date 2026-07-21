"use client";

import { useEffect, useState } from "react";

import {
  Bot,
  Package,
  User,
  Phone,
  Mail,
  Calendar,
  ClipboardList,
  Hash,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Circle,
  FileText,
  Upload,
} from "lucide-react";

import ActionButton from "./ActionButton";

function InfoRow({ icon, label, value }) {
  const completed = value !== undefined && value !== null && value !== "";

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
        completed
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div>
        {completed ? (
          <CheckCircle2 size={18} className="text-green-600" />
        ) : (
          <Circle size={18} className="text-slate-400" />
        )}
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
        {icon}
      </div>

      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wide text-slate-500">
          {label}
        </div>

        <div className="break-words font-medium">
          {completed ? value : "Not provided"}
        </div>
      </div>
    </div>
  );
}

export default function OrderCard({
  message,

  form = null,

  order = null,

  items = [],

  customer = null,

  recommendations = [],

  actions = [],
}) {
  const getInitialFormData = (formData) => {
    const initialValues = {};

    formData?.sections?.forEach((section) => {
      section.fields?.forEach((field) => {
        initialValues[field.id] = field.value ?? "";
      });
    });

    return initialValues;
  };

  const [formData, setFormData] = useState(() => getInitialFormData(form));

  const updateField = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const formActions = form?.actions ?? actions;
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
      {/* =========================================
          Header
      ========================================= */}

      <div className="border-b border-slate-100 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 px-6 py-5 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
            <ShoppingBag size={26} />
          </div>

          <div>
            <div className="text-xl font-semibold">
              Deluxe AI Order Assistant
            </div>

            <div className="text-sm text-blue-100">
              Complete your order using the form below.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6">
        {(message || form?.title) && (
          <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
            <div className="border-b border-blue-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-blue-600" />

                <h3 className="font-semibold">AI Assistant</h3>
              </div>
            </div>

            <div className="space-y-3 p-5">
              {form?.title && (
                <div className="text-lg font-semibold text-slate-900">
                  {form.title}
                </div>
              )}

              {form?.description && (
                <div className="text-slate-600">{form.description}</div>
              )}

              {message && (
                <div className="rounded-xl border border-blue-100 bg-white px-4 py-3 leading-7 text-slate-700">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================
    Dynamic Order Form
========================================= */}
        {form && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <ClipboardList size={18} className="text-blue-600" />
                <h3 className="font-semibold">{form.title ?? "Order Form"}</h3>
              </div>
            </div>

            <div className="space-y-8 p-5">
              {form.sections?.map((section) => (
                <div key={section.id}>
                  <h4 className="mb-4 text-lg font-semibold text-slate-800">
                    {section.title}
                  </h4>

                  {section.fields?.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-slate-500">
                      No fields available.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                      {section.fields.map((field) => {
                        if (field.visibleWhen) {
                          const currentValue =
                            formData[field.visibleWhen.field];

                          if (currentValue !== field.visibleWhen.equals) {
                            return null;
                          }
                        }

                        const value = formData[field.id] ?? "";

                        switch (field.type) {
                          case "text":
                          case "email":
                          case "phone":
                          case "number":
                          case "date":
                            return (
                              <div key={field.id}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  {field.label}
                                  {field.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </label>

                                <input
                                  type={
                                    field.type === "phone" ? "tel" : field.type
                                  }
                                  value={value}
                                  placeholder={field.placeholder}
                                  onChange={(e) =>
                                    updateField(field.id, e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                            );

                          case "textarea":
                            return (
                              <div key={field.id} className="lg:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  {field.label}
                                  {field.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </label>

                                <textarea
                                  rows={4}
                                  value={value}
                                  placeholder={field.placeholder}
                                  onChange={(e) =>
                                    updateField(field.id, e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                />
                              </div>
                            );

                          case "select":
                            return (
                              <div key={field.id}>
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  {field.label}
                                  {field.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </label>

                                <select
                                  value={value}
                                  onChange={(e) =>
                                    updateField(field.id, e.target.value)
                                  }
                                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                >
                                  <option value="">Select</option>

                                  {field.options?.map((option) => (
                                    <option
                                      key={option.value ?? option}
                                      value={option.value ?? option}
                                    >
                                      {option.label ?? option}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            );

                          case "radio":
                            return (
                              <div key={field.id} className="lg:col-span-2">
                                <label className="mb-3 block text-sm font-medium text-slate-700">
                                  {field.label}
                                  {field.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </label>

                                <div className="space-y-3">
                                  {field.options?.map((option) => (
                                    <label
                                      key={option.value}
                                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                                        value === option.value
                                          ? "border-blue-500 bg-blue-50"
                                          : "border-slate-300 bg-white hover:border-blue-300"
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name={field.id}
                                        value={option.value}
                                        checked={value === option.value}
                                        onChange={() =>
                                          updateField(field.id, option.value)
                                        }
                                      />

                                      <span>{option.label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            );

                          case "checkbox":
                            return (
                              <div key={field.id} className="lg:col-span-2">
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 hover:border-blue-400 transition">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(value)}
                                    onChange={(e) =>
                                      updateField(field.id, e.target.checked)
                                    }
                                    className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />

                                  <span className="flex-1 text-sm font-medium text-slate-700">
                                    {field.label}
                                  </span>

                                  {field.required && (
                                    <span className="text-red-500">*</span>
                                  )}
                                </label>
                              </div>
                            );

                          case "file":
                            return (
                              <div key={field.id} className="lg:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                  {field.label}
                                  {field.required && (
                                    <span className="ml-1 text-red-500">*</span>
                                  )}
                                </label>

                                <input
                                  type="file"
                                  accept={field.accept?.join(",")}
                                  onChange={(e) =>
                                    updateField(
                                      field.id,
                                      e.target.files?.[0] ?? null,
                                    )
                                  }
                                  className="w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3"
                                />

                                {formData[field.id] && (
                                  <p className="mt-2 text-sm text-green-600">
                                    {formData[field.id].name}
                                  </p>
                                )}

                                {field.accept?.length > 0 && (
                                  <div className="mt-2 text-xs text-slate-500">
                                    Accepted: {field.accept.join(", ")}
                                  </div>
                                )}
                              </div>
                            );

                          default:
                            return (
                              <div
                                key={field.id}
                                className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-700"
                              >
                                Unsupported field type:
                                <strong> {field.type}</strong>
                              </div>
                            );
                        }
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* =========================================
    Customer Information (Recommendation Only)
========================================= */}

        {customer && !form && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <User size={18} className="text-blue-600" />

                <h3 className="font-semibold">Customer Information</h3>
              </div>
            </div>

            <div className="grid gap-3 p-5">
              <InfoRow
                icon={<User size={15} />}
                label="Name"
                value={customer.name}
              />

              <InfoRow
                icon={<Package size={15} />}
                label="Company"
                value={customer.company}
              />
            </div>
          </div>
        )}

        {/* =========================================
            Recommendations
        ========================================= */}

        {recommendations.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
            <div className="border-b border-blue-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-600" />

                <h3 className="font-semibold">Recommended Products</h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 p-5">
              {recommendations.map((product) => (
                <div
                  key={product}
                  className="rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm"
                >
                  {product}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================
            Actions
        ========================================= */}

        {formActions.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h3 className="font-semibold">Available Actions</h3>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2">
              {formActions.map((action) => (
                <ActionButton
                  key={action.id}
                  action={action}
                  formData={formData}
                  order={order}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
