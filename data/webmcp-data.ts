export const RESTAURANTS = [
  {
    id: "koji_ramen", name: "Koji Ramen House", cuisine: "Japanese",
    rating: 4.8, delivery_time: "20–30 min", delivery_fee: 2.99, emoji: "🍜",
    menu: [
      { id: "tonkotsu", name: "Tonkotsu Ramen", desc: "Rich pork bone broth, chashu, soft egg, nori", price: 16.50, category: "Ramen", emoji: "🍜", tags: [] },
      { id: "miso_ramen", name: "Miso Ramen", desc: "Fermented soybean broth, corn, butter, bean sprouts", price: 15.00, category: "Ramen", emoji: "🥣", tags: [] },
      { id: "gyoza", name: "Gyoza (6pc)", desc: "Pan-fried pork dumplings with dipping sauce", price: 8.50, category: "Sides", emoji: "🥟", tags: [] },
    ]
  },
  {
    id: "bella_napoli", name: "Bella Napoli", cuisine: "Italian",
    rating: 4.6, delivery_time: "25–35 min", delivery_fee: 3.49, emoji: "🍕",
    menu: [
      { id: "margherita", name: "Margherita Pizza", desc: "San Marzano tomato, fresh mozzarella, basil", price: 14.00, category: "Pizza", emoji: "🍕", tags: ["vegetarian"] },
      { id: "carbonara", name: "Spaghetti Carbonara", desc: "Guanciale, pecorino, egg yolk, black pepper", price: 15.00, category: "Pasta", emoji: "🍝", tags: [] },
      { id: "tiramisu", name: "Tiramisu", desc: "Mascarpone, espresso-soaked ladyfingers, cocoa", price: 8.50, category: "Dessert", emoji: "🍰", tags: [] },
    ]
  },
  {
    id: "green_fork", name: "The Green Fork", cuisine: "Vegan",
    rating: 4.7, delivery_time: "15–25 min", delivery_fee: 1.99, emoji: "🥗",
    menu: [
      { id: "buddha_bowl", name: "Buddha Bowl", desc: "Quinoa, roasted sweet potato, tahini, avocado", price: 14.50, category: "Bowls", emoji: "🥗", tags: ["vegan", "gf"] },
      { id: "acai_bowl", name: "Açaí Bowl", desc: "Blended açaí, banana, granola, coconut flakes", price: 12.00, category: "Bowls", emoji: "🫐", tags: ["vegan", "gf"] },
    ]
  }
];

export const PROMO_CODES: Record<string, { discount: number; label: string; type: 'percent' | 'flat' | 'delivery' }> = {
  "WELCOME20": { discount: 0.20, label: "20% off", type: "percent" },
  "FREEDELIVERY": { discount: 0, label: "Free delivery", type: "delivery" },
  "SAVE5": { discount: 5, label: "$5 off", type: "flat" },
};
