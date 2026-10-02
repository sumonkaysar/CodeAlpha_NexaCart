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
