"use client";

import React from "react";
import { useWebMCPContext } from "@/contexts/WebMCPContext";

export function CheckoutForm() {
  const { cart, placeOrder } = useWebMCPContext();

  if (cart.length === 0) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // @ts-ignore - agentInvoked property logic
    const isAgent = (e.nativeEvent as any).agentInvoked;

    const formData = new FormData(e.currentTarget);
    const details = Object.fromEntries(formData);

    const order = placeOrder(details);
    
    // If invoked by agent, return the structured result
    if (isAgent && (e.nativeEvent as any).respondWith) {
      (e.nativeEvent as any).respondWith(
        Promise.resolve({ success: true, message: "Order placed", order })
      );
    }
  };

  return (
    <form
      className="flex flex-col gap-4 p-4 border rounded-lg bg-zinc-900 border-zinc-800"
      onSubmit={handleSubmit}
      toolname="checkout"
      tooldescription="Place a food delivery order. Requires address and payment method. Use AFTER adding items to cart."
    >
      <h3 className="text-lg font-bold text-white">Checkout</h3>
      
      <div>
        <label className="block text-xs uppercase text-zinc-500 mb-1">Delivery Address</label>
        <input 
          name="delivery_address" 
          required 
          className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white"
          placeholder="123 Main St"
          toolparamdescription="Full street delivery address"
        />
      </div>

      <div>
        <label className="block text-xs uppercase text-zinc-500 mb-1">Instructions</label>
        <textarea 
          name="delivery_instructions" 
          className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white h-20"
          placeholder="Gate code, etc."
          toolparamdescription="Delivery instructions"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-xs uppercase text-zinc-500 mb-1">Tip</label>
          <select 
            name="tip_amount" 
            className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white"
            toolparamdescription="Tip amount"
            defaultValue="5"
          >
            <option value="0">No tip</option>
            <option value="3">$3.00</option>
            <option value="5">$5.00</option>
            <option value="10">$10.00</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs uppercase text-zinc-500 mb-1">Payment</label>
          <select 
            name="payment_method" 
            required 
            className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white"
            toolparamdescription="Payment method"
            defaultValue="visa"
          >
            <option value="visa">Visa ···4242</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      <button 
        type="submit" 
        className="mt-2 w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded transition-colors"
      >
        Place Order
      </button>
    </form>
  );
}
