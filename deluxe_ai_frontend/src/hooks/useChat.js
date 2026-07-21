"use client";

import { useCallback, useState } from "react";

import chatService from "../services/ChatService";
import sessionService from "../services/SessionService";

export default function useChat() {
  const [sessionId, setSessionId] = useState(() =>
    sessionService.getSessionId(),
  );

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [typing, setTyping] = useState(false);

  /* -------------------------------------------------- */

  const createMessage = ({
    role,
    type = "text",
    content = "",
    message = "",
    data = {},
    actions = [],
    metadata = {},
  }) => ({
    id: crypto.randomUUID(),

    role,

    type,

    content,

    message,

    data,

    actions,

    metadata,

    createdAt: new Date().toISOString(),
  });

  /* -------------------------------------------------- */

  const addUserMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      createMessage({
        role: "user",
        content: text,
      }),
    ]);
  };

  /* -------------------------------------------------- */

  const addAssistantMessage = (response) => {
    setMessages((prev) => [
      ...prev,
      createMessage({
        role: "assistant",

        type: response.type,

        message: response.message,

        data: response.data,

        actions: response.actions ?? [],

        metadata: response.metadata ?? {},
      }),
    ]);
  };

  /* -------------------------------------------------- */

  const sendMessage = useCallback(
    async (text = "", action = null) => {
      const message = text?.trim() ?? "";

      if (!message && !action) return;

      if (loading) return;

      /*
       * Show button click as a user message
       */

      if (message) {
        addUserMessage(message);
      } else if (action?.label) {
        addUserMessage(action.label);
      }

      setLoading(true);
      setTyping(true);

      try {
        const response = await chatService.sendMessage(
          sessionId,
          message,
          action,
        );

        addAssistantMessage(response);
      } catch (error) {
        addAssistantMessage({
          type: "error",
          message: error?.message || "Something went wrong.",
        });
      } finally {
        setTyping(false);
        setLoading(false);
      }
    },
    [loading, sessionId],
  );

  /* -------------------------------------------------- */

  // const handleAction = useCallback(
  //   (action) => {
  //     if (!action) return;

  //     const { id, payload = {} } = action;

  //     switch (id) {
  //       case "SHOW_PRODUCT_DETAILS": {
  //         if (!payload.product) return;

  //         sendMessage(payload.product);
  //         break;
  //       }

  //       case "ORDER_PRODUCT": {
  //         if (!payload.product) return;

  //         sendMessage(`I want to order ${payload.product}`);
  //         break;
  //       }

  //       case "CONTACT_SALES": {
  //         sendMessage("I want to contact sales");
  //         break;
  //       }

  //       case "REVIEW_ORDER": {
  //         sendMessage("I want to review my order");
  //         break;
  //       }
  //       case "MODIFY_ORDER": {
  //         sendMessage("I want to modify my order");
  //         break;
  //       }
  //       case "ADD_ANOTHER_ITEM": {
  //         sendMessage("I want to add another item to my order");
  //         break;
  //       }
  //       case "CONFIRM_ORDER": {
  //         sendMessage("I want to confirm my order");
  //         break;
  //       }

  //       default:
  //         console.warn(`Unhandled action: ${id}`);
  //     }
  //   },
  //   [sendMessage],
  // );

  // const handleAction = useCallback(
  //   (action) => {
  //     if (!action) return;

  //     switch (action.id) {
  //       /*
  //        * ===========================================
  //        * Recommendation
  //        * ===========================================
  //        */
  //       case "REVIEW_ORDER":
  //         sendMessage("", action);
  //         break;

  //       case "MODIFY_ORDER":
  //         sendMessage("", action);
  //         break;

  //       case "CONFIRM_ORDER":
  //         sendMessage("", action);
  //         break;

  //       case "ADD_ANOTHER_PRODUCT":
  //         sendMessage("", action);
  //         break;

  //       case "ORDER_PRODUCT":
  //         sendMessage("", action);
  //         break;

  //       case "SHOW_PRODUCT_DETAILS":
  //         sendMessage("", action);
  //         break;

  //       case "CONTACT_SALES":
  //         sendMessage("", action);
  //         break;

  //       case "RECOMMEND_PRODUCTS":
  //         sendMessage("Recommend products");
  //         break;

  //       case "CONTACT_SALES":
  //         sendMessage("I want to talk to a sales expert");
  //         break;

  //       case "SEND_PROFILE":
  //         sendMessage("Send me your company profile");
  //         break;

  //       case "CONTACT_SUPPORT":
  //         sendMessage("I need customer support");
  //         break;

  //       case "GET_QUOTE":
  //         sendMessage("", action);
  //         break;

  //       case "ASK_BUSINESS":
  //         sendMessage("", action);
  //         break;

  //       case "ASK_INDIVIDUAL":
  //         sendMessage("", action);
  //         break;

  //       default:
  //         console.warn("Unhandled action:", action.id);
  //     }
  //   },
  //   [sendMessage],
  // );

  const handleAction = useCallback(
    (action) => {
      if (!action) return;

      switch (action.id) {
        /*
         * ===========================================
         * Recommendation Workflow
         * ===========================================
         */

        case "RECOMMENDATION_BUSINESS":
        case "RECOMMENDATION_INDIVIDUAL":

        case "BUSINESS_CAFE":
        case "BUSINESS_RESTAURANT":
        case "BUSINESS_HOTEL":
        case "BUSINESS_RETAIL":
        case "BUSINESS_HOSPITAL":
        case "BUSINESS_OTHER":

        case "GOAL_BRANDING":
        case "GOAL_PROMOTION":
        case "GOAL_PACKAGING":
        case "GOAL_SIGNAGE":

        case "ORDER_PRODUCT":
        case "SHOW_PRODUCT_DETAILS":
        case "GET_QUOTE":
        case "CONTACT_SALES":
          sendMessage("", action);
          break;
        /*
         * ===========================================
         * Product & Ordering
         * ===========================================
         */

        case "START_ORDER":
        case "ORDER_PRODUCT":
        case "SHOW_PRODUCT_DETAILS":
        case "COMPARE_PRODUCT":
        case "COMPARE_PRODUCTS":
        case "GET_QUOTE":
        case "CONTACT_SALES":
          sendMessage("", action);
          break;

        /*
         * ===========================================
         * Order Workflow
         * ===========================================
         */

        case "CONTINUE_ORDER":
        case "ADD_MORE_ITEMS":
        case "ADD_RELATED_PRODUCT":
        case "REVIEW_ORDER":
        case "EDIT_ORDER":
        case "CONFIRM_ORDER":
        case "CANCEL_ORDER":

        case "SUBMIT_ORDER":
        case "submit":

        case "cancel":
          sendMessage("", action);
          break;

        /*
         * ===========================================
         * Quick Actions
         * ===========================================
         */

        case "RECOMMEND_PRODUCTS":
          sendMessage("Recommend products");
          break;

        case "SEND_PROFILE":
          sendMessage("Send me your company profile");
          break;

        case "CONTACT_SUPPORT":
          sendMessage("I need customer support");
          break;

        default:
          console.warn("Unhandled action:", action.id);
      }
    },
    [sendMessage],
  );

  /* -------------------------------------------------- */

  const clearChat = () => {
    const id = sessionService.newSession();

    setSessionId(id);

    setMessages([]);
  };

  /* -------------------------------------------------- */

  return {
    sessionId,

    messages,

    loading,

    typing,

    sendMessage,

    handleAction,

    clearChat,

    setMessages,
  };
}
