"use client";

import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useWebMCP } from '@/hooks/useWebMCP';
import { RESTAURANTS, PROMO_CODES } from '@/data/webmcp-data';

// --- Types ---

interface CartItem {
  item: any;
  restaurant: any;
  qty: number;
  special_instructions?: string;
}

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  estimated_delivery: string;
  [key: string]: any;
}

interface WebMCPContextType {
  restaurants: typeof RESTAURANTS;
  currentRestaurant: string | null;
  cart: CartItem[];
  promo: { code: string; label: string } | null;
  order: Order | null;
  isReady: boolean;
  logs: string[];
  
  // UI Actions
  setCurrentRestaurant: (id: string | null) => void;
  addToCart: (restaurantId: string, itemId: string, qty?: number, instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  placeOrder: (details: any) => Order;
  getCartTotal: () => { subtotal: number; deliveryFees: number; discount: number; total: number };
}

const WebMCPContext = createContext<WebMCPContextType | null>(null);

export function useWebMCPContext() {
  const context = useContext(WebMCPContext);
  if (!context) throw new Error("useWebMCPContext must be used within a WebMCPProvider");
  return context;
}

export function WebMCPProvider({ children }: { children: ReactNode }) {
  // --- State ---
  const [currentRestaurant, setCurrentRestaurant] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<{ code: string; label: string; details: any } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  // --- Helpers ---
  const getCartTotal = () => {
    const subtotal = cart.reduce((s, c) => s + (c.item.price * c.qty), 0);
    const deliveryFees = [...new Set(cart.map(c => c.restaurant.id))].reduce((s, rid) => {
      const r = RESTAURANTS.find(x => x.id === rid);
      return s + (r ? r.delivery_fee : 0);
    }, 0);
    
    let discount = 0, deliveryDiscount = 0;
    if (promo) {
      if (promo.details.type === 'percent') discount = subtotal * promo.details.discount;
      if (promo.details.type === 'flat') discount = Math.min(promo.details.discount, subtotal);
      if (promo.details.type === 'delivery') deliveryDiscount = deliveryFees;
    }
    
    return { 
      subtotal, 
      deliveryFees, 
      discount: discount + deliveryDiscount, 
      total: subtotal + deliveryFees - discount - deliveryDiscount 
    };
  };

  // --- Imperative Actions (Passed to useWebMCP) ---
  const actions = useMemo(() => ({
    searchRestaurants: (query: string) => {
      const q = query.toLowerCase();
      const results = RESTAURANTS.filter(r =>
        r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
      );
      // In a real app, you might filter the UI list here.
      // For now, we return the data to the agent.
      return { success: true, count: results.length, restaurants: results.map(r => ({ id: r.id, name: r.name })) };
    },

    getMenu: (restaurantId: string) => {
      const r = RESTAURANTS.find(x => x.id === restaurantId);
      if (!r) return { success: false, error: "Not found" };
      setCurrentRestaurant(restaurantId); // Side effect: Navigate UI
      return { success: true, restaurant: { name: r.name }, menu: r.menu };
    },

    addToCart: (restaurantId: string, itemId: string, quantity: number = 1, instructions: string = "") => {
      const r = RESTAURANTS.find(x => x.id === restaurantId);
      if (!r) return { success: false, error: "Restaurant not found" };
      const item = r.menu?.find(i => i.id === itemId);
      if (!item) return { success: false, error: "Item not found" };

      setCart(prev => {
        const existingIdx = prev.findIndex(c => c.item.id === itemId);
        if (existingIdx > -1) {
          const newCart = [...prev];
          newCart[existingIdx].qty += quantity;
          if (instructions) newCart[existingIdx].special_instructions = instructions;
          return newCart;
        }
        return [...prev, { item, restaurant: r, qty: quantity, special_instructions: instructions }];
      });
      
      return { success: true, added: item.name };
    },

    removeFromCart: (itemId: string) => {
      setCart(prev => {
        const idx = prev.findIndex(c => c.item.id === itemId);
        if (idx === -1) return prev;
        const newCart = [...prev];
        newCart[idx].qty -= 1;
        if (newCart[idx].qty <= 0) newCart.splice(idx, 1);
        return newCart;
      });
      return { success: true, removed: itemId };
    },

    getCart: () => {
      const t = getCartTotal();
      return { 
        success: true, 
        items: cart.map(c => ({ name: c.item.name, qty: c.qty, price: c.item.price })), 
        total: t.total 
      };
    },

    clearCart: () => {
      setCart([]);
      setPromo(null);
      return { success: true };
    },

    applyPromoCode: (code: string) => {
      const p = PROMO_CODES[code.toUpperCase()];
      if (p) {
        setPromo({ code: code.toUpperCase(), label: p.label, details: p });
        return { success: true, applied: p.label };
      }
      return { success: false, error: "Invalid code" };
    },

    getOrderStatus: () => {
      if (!order) return { success: false, error: "No order placed" };
      return { success: true, order };
    }
  }), [cart, order, promo]); // Dependencies for the actions closure

  // --- Connect to WebMCP ---
  const { isReady, logs } = useWebMCP(actions);

  // --- Public Interface ---
  const placeOrder = (details: any) => {
    const t = getCartTotal();
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      items: cart.map(c => ({ name: c.item.name, qty: c.qty })),
      total: t.total,
      status: "confirmed",
      estimated_delivery: "30–45 mins",
      ...details
    };
    setOrder(newOrder);
    setCart([]); // Clear cart after order
    return newOrder;
  };

  return (
    <WebMCPContext.Provider value={{
      restaurants: RESTAURANTS,
      currentRestaurant,
      cart,
      promo,
      order,
      isReady,
      logs,
      setCurrentRestaurant,
      addToCart: actions.addToCart,
      removeFromCart: actions.removeFromCart,
      clearCart: actions.clearCart,
      placeOrder,
      getCartTotal
    }}>
      {children}
    </WebMCPContext.Provider>
  );
}
