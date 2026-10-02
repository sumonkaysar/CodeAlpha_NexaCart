const API_BASE_URL = "https://nexacart-server.vercel.app/api";
const CART_KEY = "nexacart_cart";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=80";
let allProducts = [];
let activeCategory = "All";
let toastTimer;

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

function updateCartCount() {
  const count = getCart().reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  document.querySelectorAll("#cart-count").forEach((element) => {
    element.textContent = count;
  });
}

function escapeHTML(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function safeImage(value) {
  try {
    const image = new URL(value || FALLBACK_IMAGE, window.location.href);
    return ["https:", "http:"].includes(image.protocol)
      ? image.href
      : FALLBACK_IMAGE;
  } catch {
    return FALLBACK_IMAGE;
  }
}

function money(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.hidden = true;
  }, 2600);
}

function showConfirm(message) {
  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "app-confirm-dialog";

    const content = document.createElement("div");
    content.className = "app-confirm-content";
    const title = document.createElement("h2");
    title.id = "app-confirm-title";
    title.textContent = "Confirm action";
    dialog.setAttribute("aria-labelledby", title.id);
    const description = document.createElement("p");
    description.textContent = message;
    const actions = document.createElement("div");
    actions.className = "app-confirm-actions";
    const cancel = document.createElement("button");
    cancel.className = "button button-light";
    cancel.type = "button";
    cancel.textContent = "Cancel";
    const confirm = document.createElement("button");
    confirm.className = "button";
    confirm.type = "button";
    confirm.textContent = "Confirm";

    cancel.addEventListener("click", () => dialog.close("cancel"));
    confirm.addEventListener("click", () => dialog.close("confirm"));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close("cancel");
    });
    dialog.addEventListener(
      "close",
      () => {
        resolve(dialog.returnValue === "confirm");
        dialog.remove();
      },
      { once: true },
    );

    actions.append(cancel, confirm);
    content.append(title, description, actions);
    dialog.append(content);
    document.body.append(dialog);
    dialog.showModal();
  });
}

function checkAuth() {
  const nav = document.getElementById("user-nav");
  const token = localStorage.getItem("nexacart_token");
  const username = localStorage.getItem("nexacart_username");
  const role = localStorage.getItem("nexacart_role");

  if (nav && token) {
    const adminLink =
      role === "admin" && !document.getElementById("product-form")
        ? '<a href="admin.html">Manage</a>'
        : "";

    nav.innerHTML = `${adminLink}<span class="account-name">Hi, ${escapeHTML(username || "there")}</span><button class="text-button" type="button" data-action="logout">Sign out</button>`;
  }
}

function logout() {
  localStorage.removeItem("nexacart_token");
  localStorage.removeItem("nexacart_username");
  localStorage.removeItem("nexacart_role");
  window.location.reload();
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      data.error || data.message || "Something went wrong. Please try again.",
    );

  return data;
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  return fetchJSON(`${API_BASE_URL}/uploads/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("nexacart_token")}`,
    },
    body: formData,
  });
}
