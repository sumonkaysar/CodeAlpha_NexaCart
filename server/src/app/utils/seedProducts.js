const Product = require("../modules/product/product.model");

const starterProducts = [
  {
    name: "Studio Wireless Headphones",
    price: 189,
    category: "Audio",
    description: "Immersive, balanced sound with adaptive noise cancelling and 40-hour battery life.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },
  {
    name: "Forma Everyday Watch",
    price: 245,
    category: "Wearables",
    description: "A considered everyday timepiece with a brushed steel case and soft-touch strap.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85",
    featured: true,
  },
  {
    name: "Orbit Portable Speaker",
    price: 129,
    category: "Audio",
    description: "Room-filling sound in a compact, travel-ready body with a 16-hour playtime.",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Everywhere Pack",
    price: 98,
    category: "Carry",
    description: "A streamlined, weather-resistant day pack with smart storage for daily essentials.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Arc Table Light",
    price: 156,
    category: "Living",
    description: "Sculptural ambient lighting with a warm dimmable glow and tactile controls.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=85",
  },
  {
    name: "Motion Runner",
    price: 112,
    category: "Wearables",
    description: "Lightweight cushioning and a breathable knit upper, built for everyday movement.",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=85",
  },
];

const seedProducts = async () => {
  if (await Product.exists()) {
    console.log("Products already exist. Skipping catalog seed.");
    return;
  }

  await Product.insertMany(starterProducts);
  console.log("Starter product catalog created.");
};

module.exports = seedProducts;