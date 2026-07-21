"use client";

import { Bot, User, Phone, Mail, BadgeCheck } from "lucide-react";

import ActionButton from "./ActionButton";

export default function LeadCard({
  step,
  message,
  customer,
  assignedTo,
  actions = [],
}) {
  return (
    <div className="space-y-5">
      {/* ===========================================
          AI Message
      =========================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
              <Bot size={24} />
            </div>

            <div>
              <h2 className="font-semibold">Deluxe AI Assistant</h2>

              <p className="text-sm text-slate-300">Quote & Sales Assistance</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="leading-8 text-slate-700">{message}</p>
        </div>
      </div>

      {/* ===========================================
          Customer
      =========================================== */}

      {(customer?.name || customer?.phone || customer?.email) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h3 className="mb-5 font-semibold">Customer Information</h3>

          <div className="space-y-4">
            {customer.name && (
              <Field
                icon={<User size={18} />}
                label="Name"
                value={customer.name}
              />
            )}

            {customer.phone && (
              <Field
                icon={<Phone size={18} />}
                label="Phone"
                value={customer.phone}
              />
            )}

            {customer.email && (
              <Field
                icon={<Mail size={18} />}
                label="Email"
                value={customer.email}
              />
            )}
          </div>
        </div>
      )}

      {/* ===========================================
          Assigned Sales
      =========================================== */}

      {assignedTo && (
        <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck size={22} className="text-green-600" />

            <div>
              <div className="font-semibold">Assigned Sales Specialist</div>

              <div className="text-sm text-slate-600">{assignedTo.name}</div>

              <div className="text-sm text-slate-500">{assignedTo.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* ===========================================
          Actions
      =========================================== */}

      {actions.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 p-4">
      <div className="text-blue-600">{icon}</div>

      <div>
        <div className="text-xs uppercase tracking-wide text-slate-400">
          {label}
        </div>

        <div className="font-medium text-slate-800">{value}</div>
      </div>
    </div>
  );
}
