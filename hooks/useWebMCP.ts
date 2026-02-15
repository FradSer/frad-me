"use client";

import { useEffect, useState } from "react";

export interface WebMCPActions {
  searchRestaurants: (query: string) => any;
  getMenu: (restaurantId: string) => any;
  addToCart: (restaurantId: string, itemId: string, quantity: number, instructions: string) => any;
  removeFromCart: (itemId: string) => any;
  getCart: () => any;
  clearCart: () => any;
  applyPromoCode: (code: string) => any;
  getOrderStatus: () => any;
}

export function useWebMCP(actions: WebMCPActions) {
  const [isReady, setIsReady] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log(`[WebMCP] ${msg}`);
    setLogs((prev) => [...prev, msg].slice(-50));
  };

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.modelContext) {
      log("WebMCP API not found (navigator.modelContext)");
      return;
    }

    const mc = navigator.modelContext;

    // 1. search_restaurants
    mc.registerTool({
      name: "search_restaurants",
      description: "Search for restaurants by cuisine type, name, or dietary preference.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Cuisine, name, or tag" },
        },
        required: ["query"],
      },
      execute: async ({ query }) => {
        const result = await actions.searchRestaurants(query);
        log(`search_restaurants("${query}")`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 2. get_menu
    mc.registerTool({
      name: "get_menu",
      description: "Get the full menu for a restaurant by ID.",
      inputSchema: {
        type: "object",
        properties: {
          restaurant_id: { type: "string", description: "Restaurant ID" },
        },
        required: ["restaurant_id"],
      },
      execute: async ({ restaurant_id }) => {
        const result = await actions.getMenu(restaurant_id);
        log(`get_menu("${restaurant_id}")`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 3. add_to_cart
    mc.registerTool({
      name: "add_to_cart",
      description: "Add a menu item to the cart.",
      inputSchema: {
        type: "object",
        properties: {
          restaurant_id: { type: "string" },
          item_id: { type: "string" },
          quantity: { type: "number" },
          special_instructions: { type: "string" },
        },
        required: ["restaurant_id", "item_id"],
      },
      execute: async ({ restaurant_id, item_id, quantity, special_instructions }) => {
        const result = await actions.addToCart(restaurant_id, item_id, quantity || 1, special_instructions || "");
        log(`add_to_cart("${item_id}")`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 4. remove_from_cart
    mc.registerTool({
      name: "remove_from_cart",
      description: "Remove an item from the cart.",
      inputSchema: {
        type: "object",
        properties: { item_id: { type: "string" } },
        required: ["item_id"],
      },
      execute: async ({ item_id }) => {
        const result = await actions.removeFromCart(item_id);
        log(`remove_from_cart("${item_id}")`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 5. get_cart
    mc.registerTool({
      name: "get_cart",
      description: "Get current cart contents and totals (read-only).",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const result = await actions.getCart();
        log("get_cart()");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 6. clear_cart
    mc.registerTool({
      name: "clear_cart",
      description: "Empty the cart.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const result = await actions.clearCart();
        log("clear_cart()");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 7. apply_promo_code
    mc.registerTool({
      name: "apply_promo_code",
      description: "Apply a discount code.",
      inputSchema: {
        type: "object",
        properties: { code: { type: "string" } },
        required: ["code"],
      },
      execute: async ({ code }) => {
        const result = await actions.applyPromoCode(code);
        log(`apply_promo_code("${code}")`);
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    // 8. get_order_status
    mc.registerTool({
      name: "get_order_status",
      description: "Check status of the current order.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        const result = await actions.getOrderStatus();
        log("get_order_status()");
        return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
      },
    });

    setIsReady(true);
    log("Tools registered successfully.");

  }, [actions]);

  return { isReady, logs };
}
