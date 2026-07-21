"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal, LoaderCircle, Sparkles } from "lucide-react";

import { useChatContext } from "../../context/ChatContext";

export default function ChatInput() {
  const { sendMessage, loading } = useChatContext();

  const [message, setMessage] = useState("");

  const textareaRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height =
      Math.min(textareaRef.current.scrollHeight, 160) + "px";
  }, [message]);

  async function handleSubmit() {
    const text = message.trim();

    if (!text || loading) return;

    setMessage("");

    await sendMessage(text);
  }

  function handleKeyDown(e) {
    if (e.key !== "Enter") return;

    if (e.shiftKey) return;

    e.preventDefault();

    handleSubmit();
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {/* Input */}

      <div
        className="
          rounded-3xl
          border
          border-slate-200
          bg-slate-50

          transition-all

          focus-within:border-blue-500
          focus-within:bg-white
          focus-within:ring-4
          focus-within:ring-blue-100
        "
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about products, quotations, orders or comparisons..."
          className="
            max-h-40
            min-h-[56px]
            w-full

            resize-none

            rounded-t-3xl

            bg-transparent

            px-5
            pt-4

            text-[15px]
            leading-7
            text-slate-700

            placeholder:text-slate-400

            focus:outline-none

            disabled:cursor-not-allowed
          "
        />

        {/* Bottom Bar */}

        <div
          className="
            flex
            items-center
            justify-between

            px-4
            pb-3
          "
        >
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={14} className="text-blue-500" />

            <span>Press Enter to send • Shift + Enter for new line</span>
          </div>

          <button
            disabled={!message.trim() || loading}
            onClick={handleSubmit}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center

              rounded-full

              bg-gradient-to-r
              from-blue-600
              to-indigo-600

              text-white

              shadow-md

              transition-all

              hover:scale-105
              hover:shadow-lg

              active:scale-95

              disabled:scale-100
              disabled:bg-slate-300
              disabled:shadow-none
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <SendHorizontal size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Footer */}

      <div className="mt-3 text-center text-[11px] text-slate-400">
        Deluxe AI can recommend products, compare solutions, generate
        quotations, and guide you through placing an order.
      </div>
    </div>
  );
}
