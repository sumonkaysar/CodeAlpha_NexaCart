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
  const inventory = document.getElementById("inventory-section");
  inventory.hidden = false;

  const fileInput = document.getElementById("product-image");
  const uploadButton = document.getElementById("upload-image-button");
  const submitButton = document.getElementById("save-product-button");
  const imageUrlInput = document.getElementById("uploaded-image-url");
  const preview = document.getElementById("uploaded-image-preview");
  const previewImage = document.getElementById("preview-image");
  const previewName = document.getElementById("preview-name");
  const dropzone = document.getElementById("image-dropzone");
  const message = document.getElementById("product-form-message");
  const formTitle = document.getElementById("product-form-title");
  const cancelEditButton = document.getElementById("cancel-edit-button");
  const productList = document.getElementById("admin-products");
  const productCount = document.getElementById("admin-product-count");
  let selectedFile = null;
  let previewObjectUrl = null;
  let editingProductId = null;
  let inventoryProducts = [];
  let inventoryView = "active";

  const setMessage = (text, success = false) => {
    message.textContent = text;
    message.classList.toggle("is-success", success);
  };

  const adminFetchJSON = (url, options = {}) =>
    fetchJSON(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

  const renderInventory = () => {
    const search = document
      .getElementById("admin-product-search")
      .value.trim()
      .toLowerCase();
    const showArchived = inventoryView === "archived";
    const products = inventoryProducts.filter((product) => {
      const matchesStatus = Boolean(product.deletedAt) === showArchived;
      const matchesSearch = `${product.name} ${product.category || ""}`
        .toLowerCase()
        .includes(search);
      return matchesStatus && matchesSearch;
    });

    productCount.textContent = `${products.length} ${products.length === 1 ? "product" : "products"}`;

    if (!products.length) {
      const heading = search
        ? "No matching products"
        : showArchived
          ? "No archived products"
          : "No products yet";
      const detail = search
        ? "Try another product name or category."
        : showArchived
          ? "Archived products will appear here."
          : "Create your first product above.";
      productList.innerHTML = `<div class="empty-state"><h3>${heading}</h3><p>${detail}</p></div>`;
      return;
    }

    productList.innerHTML = products
      .map((product) => {
        const id = escapeHTML(product._id);
        const isArchived = Boolean(product.deletedAt);
        const stateAction = isArchived
          ? `<button class="inventory-action" type="button" data-product-action="restore" data-id="${id}">Restore</button>`
          : `<button class="inventory-action" type="button" data-product-action="archive" data-id="${id}">Archive</button>`;
        return `<article class="inventory-row${isArchived ? " is-archived" : ""}">
          <img class="inventory-image" src="${escapeHTML(safeImage(product.image))}" alt="" loading="lazy">
          <div class="inventory-product"><strong>${escapeHTML(product.name)}</strong><span>${escapeHTML(product.category || "Uncategorized")}${product.featured ? " · Featured" : ""}</span></div>
          <span class="inventory-price">${money(product.price)}</span>
          <span class="inventory-status">${isArchived ? "Archived" : "Active"}</span>
          <div class="inventory-actions">
            <button class="inventory-action" type="button" data-product-action="edit" data-id="${id}">Edit</button>
            ${stateAction}
            <button class="inventory-action is-destructive" type="button" data-product-action="delete" data-id="${id}">Delete permanently</button>
          </div>
        </article>`;
      })
      .join("");
  };

  const loadAdminProducts = async () => {
    productList.innerHTML = '<p class="loading-state">Loading products…</p>';

    try {
      inventoryProducts = await adminFetchJSON(
        `${API_BASE_URL}/products/admin`,
      );
      renderInventory();
    } catch (error) {
      productList.innerHTML = `<div class="empty-state"><h3>Products could not be loaded</h3><p>${escapeHTML(error.message)}</p></div>`;
    }
  };

  const resetProductForm = () => {
    form.reset();
    fileInput.value = "";
    imageUrlInput.value = "";
    preview.hidden = true;
    selectedFile = null;
    editingProductId = null;
    submitButton.disabled = true;
    submitButton.textContent = "Create product";
    formTitle.textContent = "Add a product";
    cancelEditButton.hidden = true;
    uploadButton.disabled = true;
    uploadButton.textContent = "Upload image";

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

    previewObjectUrl = null;
  };

  const startEditing = (product) => {
    editingProductId = String(product._id);
    form.elements.name.value = product.name || "";
    form.elements.price.value = product.price ?? "";
    form.elements.category.value = product.category || "";
    form.elements.description.value = product.description || "";
    form.elements.featured.checked = Boolean(product.featured);
    fileInput.value = "";
    selectedFile = null;
    imageUrlInput.value = product.image || "";
    uploadButton.disabled = true;
    uploadButton.textContent = "Upload image";
    preview.hidden = !product.image;

    if (product.image) {
      previewImage.src = safeImage(product.image);
      previewName.textContent = "Current product image";
    }

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    formTitle.textContent = "Edit product";
    submitButton.disabled = false;
    submitButton.textContent = "Save changes";
    cancelEditButton.hidden = false;
    setMessage("");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  productList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-product-action]");
    if (!button) return;

    const product = inventoryProducts.find(
      (entry) => String(entry._id) === button.dataset.id,
    );
    if (!product) return;

    if (button.dataset.productAction === "edit") return startEditing(product);

    if (
      button.dataset.productAction === "delete" &&
      !window.confirm(
        `Permanently delete “${product.name}”? This cannot be undone.`,
      )
    )
      return;

    const action = button.dataset.productAction;
    const endpoint =
      action === "archive"
        ? `${API_BASE_URL}/products/${encodeURIComponent(product._id)}/soft-delete`
        : action === "restore"
          ? `${API_BASE_URL}/products/${encodeURIComponent(product._id)}/restore`
          : `${API_BASE_URL}/products/${encodeURIComponent(product._id)}`;
    button.disabled = true;

    try {
      await adminFetchJSON(endpoint, {
        method: action === "delete" ? "DELETE" : "PATCH",
      });

      if (editingProductId === String(product._id)) resetProductForm();

      await loadAdminProducts();
    } catch (error) {
      button.disabled = false;
      showToast(error.message);
    }
  });

  document
    .getElementById("admin-product-search")
    .addEventListener("input", renderInventory);
  document.querySelectorAll("[data-inventory-view]").forEach((button) => {
    button.addEventListener("click", () => {
      inventoryView = button.dataset.inventoryView;
      document.querySelectorAll("[data-inventory-view]").forEach((tab) => {
        const selected = tab === button;
        tab.classList.toggle("is-active", selected);
        tab.setAttribute("aria-selected", String(selected));
      });
      renderInventory();
    });
  });

  cancelEditButton.addEventListener("click", resetProductForm);
  loadAdminProducts();

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
      `Image selected. Upload it before ${editingProductId ? "saving changes" : "creating the product"}.`,
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
      submitButton.disabled = !editingProductId;
      uploadButton.disabled = true;
      uploadButton.textContent = "Upload image";
      if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
      previewObjectUrl = null;
      setMessage("Choose an image to continue.");
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isEditing = Boolean(editingProductId);
    if (!isEditing && !imageUrlInput.value)
      return setMessage("Upload a product image first.");

    submitButton.disabled = true;
    submitButton.textContent = isEditing
      ? "Saving changes…"
      : "Creating product…";
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
      const result = await adminFetchJSON(
        isEditing
          ? `${API_BASE_URL}/products/${encodeURIComponent(editingProductId)}`
          : `${API_BASE_URL}/products`,
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        },
      );

      resetProductForm();
      await loadAdminProducts();

      setMessage(
        isEditing
          ? `${result.product.name} was updated.`
          : `${result.product.name} is now in the NexaCart collection.`,
        true,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      if (!editingProductId) {
        submitButton.disabled = true;
        submitButton.textContent = "Create product";
      }
    }
  });
}
