"use client";

import React from "react";
import { WebMCPProvider, useWebMCPContext } from "@/contexts/WebMCPContext";
import { CheckoutForm } from "@/components/webmcp/CheckoutForm";

function WebMCPDemoUI() {
  const { 
    restaurants, currentRestaurant, setCurrentRestaurant, 
    cart, addToCart, removeFromCart, getCartTotal, 
    isReady, logs, order 
  } = useWebMCPContext();

  const activeRestaurant = restaurants.find(r => r.id === currentRestaurant);
  const { total } = getCartTotal();

  if (order) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-zinc-900 rounded-2xl border border-zinc-800">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-white mb-2">Order Placed!</h1>
        <p className="text-zinc-400 mb-6">ID: {order.id}</p>
        <div className="text-orange-500 font-mono text-sm bg-orange-500/10 py-2 px-4 rounded-full inline-block">
          ETA: {order.estimated_delivery}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-8 block w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded text-white"
        >
          Start New Order
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
      <header className="flex items-center justify-between mb-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-serif font-bold">midnight<span className="text-orange-500">eats</span></h1>
          {isReady && (
            <span className="text-[10px] uppercase tracking-wider text-green-500 border border-green-500/30 px-2 py-0.5 rounded">
              WebMCP Active
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-400">
          Cart: <span className="text-white font-bold">{cart.reduce((s,c)=>s+c.qty,0)}</span> items
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Content (Restaurant List or Menu) */}
        <div className="lg:col-span-2 space-y-6">
          
          {!activeRestaurant ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => setCurrentRestaurant(r.id)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-600 transition-colors"
                >
                  <div className="h-24 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-4xl">
                    {r.emoji}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{r.name}</h3>
                    <p className="text-zinc-500 text-sm">{r.cuisine} · {r.rating}★</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setCurrentRestaurant(null)}
                className="mb-4 text-sm text-zinc-400 hover:text-white flex items-center gap-1"
              >
                ← Back to Restaurants
              </button>
              
              <div className="mb-6">
                <h2 className="text-3xl font-serif font-bold flex items-center gap-2">
                  {activeRestaurant.emoji} {activeRestaurant.name}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">{activeRestaurant.cuisine}</p>
              </div>

              <div className="space-y-3">
                {activeRestaurant.menu.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{item.emoji}</span>
                      <div>
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="text-xs text-zinc-500">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-zinc-400">${item.price.toFixed(2)}</span>
                      <button 
                        onClick={() => addToCart(activeRestaurant.id, item.id)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded text-sm"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Cart & Logs */}
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4">Your Order</h3>
            
            {cart.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Cart is empty</p>
            ) : (
              <div className="space-y-4">
                {cart.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div>
                      <div>{c.item.name} <span className="text-zinc-500">x{c.qty}</span></div>
                      <div className="text-xs text-zinc-600">{c.restaurant.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">${(c.item.price * c.qty).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(c.item.id)} className="text-zinc-600 hover:text-red-500">×</button>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-zinc-800 pt-4 mt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <CheckoutForm />
              </div>
            )}
          </div>

          {/* Agent Logs */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-4 font-mono text-xs text-zinc-500 h-48 overflow-y-auto">
            <div className="text-zinc-700 uppercase mb-2 font-bold tracking-wider">Agent Logs</div>
            {logs.length === 0 ? (
              <div className="italic opacity-50">Waiting for agent...</div>
            ) : (
              logs.map((l, i) => <div key={i} className="mb-1">{l}</div>)
            )}
          </div>
        </div>

      </main>
    </div>
  );
}

export default function WebMCPPage() {
  return (
    <WebMCPProvider>
      <WebMCPDemoUI />
    </WebMCPProvider>
  );
}
