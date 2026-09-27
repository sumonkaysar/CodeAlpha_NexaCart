const API_BASE_URL = "http://localhost:5000/api";
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

function renderCategories(products) {
  const container = document.getElementById("category-filter");
  if (!container) return;
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
  if (!categories.includes(activeCategory)) activeCategory = "All";
  container.innerHTML = categories
    .map(
      (category) =>
        `<button class="filter-button${category === activeCategory ? " is-active" : ""}" type="button" data-category="${escapeHTML(category)}" aria-pressed="${category === activeCategory}">${escapeHTML(category)}</button>`,
    )
    .join("");
}

function productCard(product, index) {
  const id = escapeHTML(product._id || product.id);
  const category = escapeHTML(product.category || "Objects");
  const featured = product.featured
    ? '<span class="product-badge">Nexa pick</span>'
    : "";
  const detail = `product.html?id=${encodeURIComponent(product._id || product.id)}`;
  return `<article class="product-card" style="animation-delay:${Math.min(index * 45, 240)}ms">
    <a class="product-visual" href="${detail}" aria-label="View ${escapeHTML(product.name)}"><img src="${escapeHTML(safeImage(product.image))}" alt="${escapeHTML(product.name)}" loading="lazy">${featured}</a>
    <div class="product-details"><div><span class="product-category">${category}</span><a class="product-name" href="${detail}">${escapeHTML(product.name)}</a></div><span class="product-price">${money(product.price)}</span></div>
    <div class="product-actions"><button class="button" type="button" data-add-product="${id}">Add to bag <span aria-hidden="true">+</span></button><a class="button button-light" href="${detail}">Details</a></div>
  </article>`;
}

function renderProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;
  const query = (document.getElementById("product-search")?.value || "")
    .trim()
    .toLowerCase();
  const sort = document.getElementById("product-sort")?.value || "featured";
  let products = allProducts.filter((product) => {
    const matchesCategory =
      activeCategory === "All" || product.category === activeCategory;
    const matchesQuery =
      `${product.name} ${product.description || ""} ${product.category || ""}`
        .toLowerCase()
        .includes(query);
    return matchesCategory && matchesQuery;
  });
  if (sort === "price-asc")
    products.sort((first, second) => first.price - second.price);
  if (sort === "price-desc")
    products.sort((first, second) => second.price - first.price);
  if (sort === "name")
    products.sort((first, second) => first.name.localeCompare(second.name));
  if (sort === "featured")
    products.sort(
      (first, second) =>
        Number(Boolean(second.featured)) - Number(Boolean(first.featured)),
    );
  const count = document.getElementById("product-count");
  if (count)
    count.textContent = `${products.length} ${products.length === 1 ? "object" : "objects"}`;
  container.innerHTML = products.length
    ? products.map(productCard).join("")
    : '<div class="empty-state"><h3>No objects found</h3><p>Try another search or category.</p></div>';
}

async function loadProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;
  try {
    allProducts = await fetchJSON(`${API_BASE_URL}/products`);
    renderCategories(allProducts);
    renderProducts();
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>We couldn't reach the shop</h3><p>${escapeHTML(error.message)} Check that the NexaCart server is running.</p></div>`;
  }
}

function addToCart(product, quantity = 1) {
  const id = String(product._id || product.id);
  const cart = getCart();
  const item = cart.find((entry) => String(entry.id) === id);
  if (item) item.quantity = Math.min(50, Number(item.quantity) + quantity);
  else
    cart.push({
      id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "",
      category: product.category || "",
      quantity: Math.min(50, quantity),
    });
  setCart(cart);
  showToast(`${product.name} added to your bag`);
}

async function loadProductDetail() {
  const container = document.getElementById("product-detail");
  if (!container) return;
  const productId = new URLSearchParams(window.location.search).get("id");
  if (!productId) {
    container.innerHTML =
      '<div class="empty-state"><h3>Product not found</h3><p>Choose an object from the shop to view its details.</p></div>';
    return;
  }
  try {
    const product = await fetchJSON(
      `${API_BASE_URL}/products/${encodeURIComponent(productId)}`,
    );
    container.innerHTML = `<div class="detail-layout"><div class="detail-image"><img src="${escapeHTML(safeImage(product.image))}" alt="${escapeHTML(product.name)}"></div><section class="detail-copy"><p class="eyebrow">${escapeHTML(product.category || "NexaCart Objects")}</p><h1>${escapeHTML(product.name)}</h1><p class="detail-price">${money(product.price)}</p><p class="detail-description">${escapeHTML(product.description || "A considered everyday essential, selected for quality, function, and lasting design.")}</p><div class="detail-purchase"><div class="quantity-control"><button type="button" data-detail-quantity="-1" aria-label="Decrease quantity">−</button><output id="detail-quantity">1</output><button type="button" data-detail-quantity="1" aria-label="Increase quantity">+</button></div><button class="button" type="button" data-detail-add="${escapeHTML(product._id)}">Add to bag</button></div><hr class="detail-divider"><div class="detail-assurance"><span>Thoughtfully selected, made to be used</span><span>Secure checkout with your NexaCart account</span><span>Questions? We are here to help.</span></div></section></div>`;
    container.dataset.product = JSON.stringify(product);
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Product unavailable</h3><p>${escapeHTML(error.message)}</p></div>`;
  }
}

function renderCart() {
  const container = document.getElementById("cart-items");
  if (!container) return;
  const cart = getCart();
  const summary = document.getElementById("cart-summary");
  if (!cart.length) {
    container.innerHTML =
      '<div class="empty-state"><h3>Your bag is taking a breather</h3><p>Find something considered for your everyday.</p><a class="button" href="index.html#shop">Explore the collection</a></div>';
    if (summary) summary.hidden = true;
    return;
  }
  if (summary) summary.hidden = false;
  container.innerHTML = cart
    .map(
      (item) =>
        `<article class="cart-line"><a href="product.html?id=${encodeURIComponent(item.id)}"><img src="${escapeHTML(safeImage(item.image))}" alt="${escapeHTML(item.name)}"></a><div><h2><a href="product.html?id=${encodeURIComponent(item.id)}">${escapeHTML(item.name)}</a></h2><p>${escapeHTML(item.category || "NexaCart object")}</p><div class="cart-line-controls"><div class="quantity-control compact"><button type="button" data-cart-action="decrease" data-id="${escapeHTML(item.id)}" aria-label="Decrease ${escapeHTML(item.name)} quantity">−</button><output>${Number(item.quantity)}</output><button type="button" data-cart-action="increase" data-id="${escapeHTML(item.id)}" aria-label="Increase ${escapeHTML(item.name)} quantity">+</button></div><button class="remove-button" type="button" data-cart-action="remove" data-id="${escapeHTML(item.id)}">Remove</button></div></div><span class="cart-line-price">${money(item.price * item.quantity)}</span></article>`,
    )
    .join("");
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );
  document.getElementById("cart-subtotal").textContent = money(subtotal);
  document.getElementById("cart-total").textContent = money(subtotal);
}

async function checkout() {
  const message = document.getElementById("checkout-message");
  const button = document.getElementById("checkout-button");
  const token = localStorage.getItem("nexacart_token");
  const cart = getCart();
  if (!cart.length) return;
  if (!token) {
    message.textContent = "Sign in or create an account to place your order.";
    document.getElementById("checkout-login").hidden = false;
    return;
  }
  button.disabled = true;
  button.textContent = "Placing order…";
  message.textContent = "";
  try {
    const data = await fetchJSON(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.id,
          quantity: Number(item.quantity),
        })),
      }),
    });
    setCart([]);
    document.getElementById("cart-items").innerHTML =
      `<div class="empty-state"><p class="eyebrow">Order confirmed</p><h3>Thank you for your order.</h3><p>Confirmation ${escapeHTML(data.orderId)} is now being prepared.</p><a class="button" href="index.html#shop">Continue shopping</a></div>`;
    document.getElementById("cart-summary").hidden = true;
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
    button.textContent = "Place order";
  }
}

function setFormMessage(form, message, isSuccess = false) {
  const element = form.querySelector(".form-message");
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("is-success", isSuccess);
}

async function submitAuth(form) {
  const kind = form.dataset.authForm;
  const values = Object.fromEntries(new FormData(form).entries());
  const button = form.querySelector("[type=submit]");
  button.disabled = true;
  button.textContent = kind === "login" ? "Signing in…" : "Creating account…";
  setFormMessage(form, "");
  try {
    const data = await fetchJSON(`${API_BASE_URL}/auth/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (kind === "register") {
      setFormMessage(form, "Your account is ready. Sign in to continue.", true);
      form.reset();
      window.setTimeout(() => {
        window.location.href = "login.html";
      }, 900);
      return;
    }
    localStorage.setItem("nexacart_token", data.token);
    localStorage.setItem("nexacart_username", data.username || values.email);
    localStorage.setItem("nexacart_role", data.role || "user");
    window.location.href = "index.html";
  } catch (error) {
    setFormMessage(form, error.message);
    button.disabled = false;
    button.textContent = kind === "login" ? "Sign in" : "Create account";
  }
}

function initializeProductAdmin() {
  const form = document.getElementById("product-form");
  if (!form) return;

  const token = localStorage.getItem("nexacart_token");
  const isAdmin = localStorage.getItem("nexacart_role") === "admin";
  const accessMessage = document.getElementById("admin-access");
  const workspace = document.getElementById("admin-workspace");
  if (!token || !isAdmin) {
    accessMessage.hidden = false;
    workspace.hidden = true;
    return;
  }
  workspace.hidden = false;

  const fileInput = document.getElementById("product-image");
  const uploadButton = document.getElementById("upload-image-button");
  const submitButton = document.getElementById("save-product-button");
  const imageUrlInput = document.getElementById("uploaded-image-url");
  const preview = document.getElementById("uploaded-image-preview");
  const previewImage = document.getElementById("preview-image");
  const previewName = document.getElementById("preview-name");
  const dropzone = document.getElementById("image-dropzone");
  const message = document.getElementById("product-form-message");
  let selectedFile = null;
  let previewObjectUrl = null;

  const setMessage = (text, success = false) => {
    message.textContent = text;
    message.classList.toggle("is-success", success);
  };

  const selectFile = (file) => {
    if (!file) return;
    selectedFile = null;
    imageUrlInput.value = "";
    submitButton.disabled = true;
    uploadButton.disabled = true;
    preview.hidden = true;
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      fileInput.value = "";
      return setMessage("Choose a JPG, PNG, WEBP, or GIF image.");
    }
    if (file.size > 5 * 1024 * 1024) {
      fileInput.value = "";
      return setMessage("Images must be 5 MB or smaller.");
    }

    selectedFile = file;
    uploadButton.disabled = false;
    uploadButton.textContent = "Upload image";
    preview.hidden = false;
    previewName.textContent = file.name;
    previewObjectUrl = URL.createObjectURL(file);
    previewImage.src = previewObjectUrl;
    setMessage(
      "Image selected. Upload it to NexaCart before creating the product.",
    );
  };

  fileInput.addEventListener("change", () => selectFile(fileInput.files[0]));
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });
  dropzone.addEventListener("dragleave", () =>
    dropzone.classList.remove("is-dragging"),
  );
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
    selectFile(event.dataTransfer.files[0]);
  });

  uploadButton.addEventListener("click", async () => {
    if (!selectedFile) return;
    uploadButton.disabled = true;
    uploadButton.textContent = "Uploading image…";
    setMessage("");
    try {
      const result = await uploadImage(selectedFile);
      imageUrlInput.value = result.url;
      previewImage.src = result.url;
      previewName.textContent = "Uploaded to Cloudinary";
      submitButton.disabled = false;
      setMessage("Image uploaded and ready to use.", true);
    } catch (error) {
      setMessage(error.message);
    } finally {
      uploadButton.disabled = Boolean(imageUrlInput.value);
      uploadButton.textContent = imageUrlInput.value
        ? "Image uploaded"
        : "Upload image";
    }
  });

  document
    .getElementById("remove-image-button")
    .addEventListener("click", () => {
      selectedFile = null;
      fileInput.value = "";
      imageUrlInput.value = "";
      preview.hidden = true;
      submitButton.disabled = true;
      uploadButton.disabled = true;
      uploadButton.textContent = "Upload image";
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
      setMessage("Choose an image to continue.");
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!imageUrlInput.value)
      return setMessage("Upload a product image first.");

    submitButton.disabled = true;
    submitButton.textContent = "Creating product…";
    setMessage("");
    const product = {
      name: form.elements.name.value.trim(),
      price: Number(form.elements.price.value),
      category: form.elements.category.value.trim(),
      description: form.elements.description.value.trim(),
      featured: form.elements.featured.checked,
      image: imageUrlInput.value,
    };

    try {
      const result = await fetchJSON(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(product),
      });
      form.reset();
      fileInput.value = "";
      imageUrlInput.value = "";
      preview.hidden = true;
      selectedFile = null;
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
      uploadButton.disabled = true;
      setMessage(
        `${result.product.name} is now in the NexaCart collection.`,
        true,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      submitButton.disabled = true;
      submitButton.textContent = "Create product";
    }
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest('[data-action="logout"]')) return logout();
  const category = event.target.closest("[data-category]");
  if (category) {
    activeCategory = category.dataset.category;
    renderCategories(allProducts);
    renderProducts();
  }
  const addButton = event.target.closest("[data-add-product]");
  if (addButton) {
    const product = allProducts.find(
      (entry) => String(entry._id || entry.id) === addButton.dataset.addProduct,
    );
    if (product) addToCart(product);
  }
  const cartButton = event.target.closest("[data-cart-action]");
  if (cartButton) {
    const cart = getCart();
    const item = cart.find(
      (entry) => String(entry.id) === cartButton.dataset.id,
    );
    if (!item) return;
    if (
      cartButton.dataset.cartAction === "remove" ||
      (cartButton.dataset.cartAction === "decrease" &&
        Number(item.quantity) <= 1)
    )
      setCart(cart.filter((entry) => entry !== item));
    else if (cartButton.dataset.cartAction === "increase") {
      item.quantity = Math.min(50, Number(item.quantity) + 1);
      setCart(cart);
    } else if (cartButton.dataset.cartAction === "decrease") {
      item.quantity = Number(item.quantity) - 1;
      setCart(cart);
    }
  }
  const detailQuantity = event.target.closest("[data-detail-quantity]");
  if (detailQuantity) {
    const output = document.getElementById("detail-quantity");
    output.textContent = Math.min(
      50,
      Math.max(
        1,
        Number(output.textContent) +
          Number(detailQuantity.dataset.detailQuantity),
      ),
    );
  }
  if (event.target.closest("[data-detail-add]")) {
    const product = JSON.parse(
      document.getElementById("product-detail").dataset.product || "{}",
    );
    addToCart(
      product,
      Number(document.getElementById("detail-quantity").textContent),
    );
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "product-search") renderProducts();
});
document.addEventListener("change", (event) => {
  if (event.target.id === "product-sort") renderProducts();
});
document.addEventListener("submit", (event) => {
  if (event.target.matches("[data-auth-form]")) {
    event.preventDefault();
    submitAuth(event.target);
  }
  if (event.target.matches("#header-search")) {
    event.preventDefault();
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  checkAuth();
  loadProducts();
  loadProductDetail();
  renderCart();
  initializeProductAdmin();
  document
    .getElementById("checkout-button")
    ?.addEventListener("click", checkout);
});
