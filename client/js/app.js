const API_BASE_URL = "http://localhost:5000/api";

function getCart() {
  return JSON.parse(localStorage.getItem("nexacart_cart")) || [];
}
function setCart(cart) {
  localStorage.setItem("nexacart_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (el) el.innerText = getCart().reduce((sum, i) => sum + i.quantity, 0);
}

function checkAuth() {
  const nav = document.getElementById("user-nav");
  const token = localStorage.getItem("nexacart_token");
  if (token && nav) {
    nav.innerHTML = `<button class="btn btn-secondary" onclick="logout()">Logout</button>`;
  }
}

function logout() {
  localStorage.removeItem("nexacart_token");
  window.location.reload();
}

async function loadProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const products = await res.json();

    let containerData = "";

    if (products.length === 0) {
      containerData = `<p>No products found.</p>`;
    } else {
      containerData = products
        .map(
          (p) => `
            <div class="card">
                <img src="${p.image}" alt="${p.name}">
                <h3>${p.name}</h3>
                <p>$${p.price.toFixed(2)}</p>
                <button class="btn" onclick="addToCart('${p._id}', '${p.name}', ${p.price})">Add to Cart</button>
            </div>
        `,
        )
        .join("");
    }

    container.innerHTML = containerData;
  } catch (err) {
    container.innerHTML = `<p>Error connecting to backend API.</p>`;
  }
}

function addToCart(id, name, price) {
  let cart = getCart();
  let item = cart.find((i) => i.id === id);
  if (item) item.quantity++;
  else cart.push({ id, name, price, quantity: 1 });
  setCart(cart);
  alert(`${name} added to cart!`);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  checkAuth();
  loadProducts();
});
