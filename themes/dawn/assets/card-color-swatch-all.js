class CartColorSwatchAll {
  constructor() {
    this.options = {
      limit: 250,
      visibleSwatches: 2,
      swatchSelectorPDP:
        ".custom-pdp-colors .product-variant__colors:not(.is-loaded)",
      swatchSelector: "card-color-swatch:not(.is-loaded)",
      swatchCollectionAllCollecion: "collections/all?view=color-swatches",
      sessionStorageColor: "colorSwatchesData",
    };

    this.products = null;
    this.totalProducts = window.totalProducts;

    this.lang = window.Shopify.locale || "default";
    this.sessionStorageLangKey = `${this.options.sessionStorageColor}_${this.lang}`;

    this.registerEvents();
  }

  registerEvents() {
    this.getAllColors().then((products) => {
      this.products = products;

      this.applyColorsPDP();
      this.applyColorsCardProduct();
    });

    const events = [
      "product-grid-updated",
      "related-products-loaded",
      "card-product-loaded",
      "recently-viewed-products-loaded",
      "cart-drawer-best-selling-loaded",
      "cart-drawer-rendered",
    ];

    events.forEach((event) => {
      document.addEventListener(event, () => {
        this.applyColorsCardProduct();
      });
    });
  }

  getCachedColors() {
    const colors = sessionStorage.getItem(this.sessionStorageLangKey);

    return colors ? JSON.parse(colors) : null;
  }

  saveColorsToCache(colors) {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(this.options.sessionStorageColor)) {
        sessionStorage.removeItem(key);
      }
    });

    sessionStorage.setItem(this.sessionStorageLangKey, JSON.stringify(colors));
  }

  async fetchAllColors() {
    const totalPages = Math.ceil(this.totalProducts / this.options.limit),
      langUrl = this.lang === "en" ? "" : `/${this.lang}`;

    const urls = Array.from(
      { length: totalPages },
      (_, i) =>
        `${window.location.origin}${langUrl}/${this.options.swatchCollectionAllCollecion}&page=${i + 1}`,
    );

    const responses = await Promise.all(
      urls.map((url) => fetch(url).then((res) => res.text())),
    );

    const parser = new DOMParser(),
      productColors = {};

    responses.forEach((html) => {
      const doc = parser.parseFromString(html, "text/html");
      const links = doc.querySelectorAll("a[data-refdesign]");

      links.forEach((link) => {
        const key = link.dataset.refdesign;
        if (!key) return;

        if (!productColors[key]) {
          productColors[key] = [];
        }
        productColors[key].push(link.outerHTML);
      });
    });

    this.saveColorsToCache(productColors);

    return productColors;
  }

  async getAllColors() {
    const cachedColors = this.getCachedColors();

    if (cachedColors) {
      return cachedColors;
    }

    return await this.fetchAllColors();
  }

  applyColorsPDP() {
    const colorSwatchPDP = document.querySelector(
      this.options.swatchSelectorPDP,
    );

    if (!colorSwatchPDP) return;

    const key = colorSwatchPDP.dataset.refdesign;

    if (this.products[key]?.length > 1) {
      colorSwatchPDP.innerHTML = this.products[key]?.join("");

      colorSwatchPDP.parentElement
        .querySelector(
          `.product-variant__colors a[href="${colorSwatchPDP.dataset.productUrl}"]`,
        )
        .classList.add("is-main", "active");
    }

    colorSwatchPDP.classList.add("is-loaded");
  }

  applyColorsCardProduct() {
    const colorSwatches = document.querySelectorAll(
      this.options.swatchSelector,
    );

    if (!colorSwatches.length) return;

    colorSwatches.forEach((colorSwatch) => {
      const key = colorSwatch.dataset.refdesign,
        items = this.products[key] || [];

      if (items.length <= 1) return;

      colorSwatch.innerHTML = items.join("");
      colorSwatch.classList.add("is-loaded");

      colorSwatch.parentElement
        .querySelector(
          `card-color-swatch a[href="${colorSwatch.dataset.productUrl}"]`,
        )
        ?.classList.add("is-main", "active");
    });

    document.dispatchEvent(new CustomEvent("color-swatches-loaded"));
  }
}

document.addEventListener("DOMContentLoaded", () => new CartColorSwatchAll());
