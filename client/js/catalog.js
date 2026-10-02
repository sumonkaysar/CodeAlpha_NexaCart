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

  if (item) {
    item.quantity = Math.min(50, Number(item.quantity) + quantity);
  } else {
    cart.push({
      id,
      name: product.name,
      price: Number(product.price),
      image: product.image || "",
      category: product.category || "",
      quantity: Math.min(50, quantity),
    });
  }

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

    container.innerHTML = `
      <div class="detail-layout">
        <div class="detail-image">
          <img src="${escapeHTML(safeImage(product.image))}" alt="${escapeHTML(product.name)}">
        </div>
        <section class="detail-copy">
          <p class="eyebrow">${escapeHTML(product.category || "NexaCart Objects")}</p>
          <h1>${escapeHTML(product.name)}</h1>
          <p class="detail-price">${money(product.price)}</p>
          <p class="detail-description">${escapeHTML(product.description || "A considered everyday essential, selected for quality, function, and lasting design.")}</p>
          <div class="detail-purchase">
            <div class="quantity-control">
              <button type="button" data-detail-quantity="-1" aria-label="Decrease quantity">−</button>
              <output id="detail-quantity">1</output>
              <button type="button" data-detail-quantity="1" aria-label="Increase quantity">+</button>
            </div>
            <button class="button" type="button" data-detail-add="${escapeHTML(product._id)}">Add to bag</button>
          </div>

          <hr class="detail-divider">
          
          <div class="detail-assurance">
            <span>Thoughtfully selected, made to be used</span>
            <span>Secure checkout with your NexaCart account</span>
            <span>Questions? We are here to help.</span>
          </div>
        </section>
      </div>
    `;

    container.dataset.product = JSON.stringify(product);
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><h3>Product unavailable</h3><p>${escapeHTML(error.message)}</p></div>`;
  }
}
