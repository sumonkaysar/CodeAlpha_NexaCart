document.addEventListener("click", (event) => {
  if (event.target.closest("[data-demo-credentials]")) {
    document.getElementById("email").value = "admin@example.com";
    document.getElementById("password").value = "Admin@12345";
    return;
  }

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
