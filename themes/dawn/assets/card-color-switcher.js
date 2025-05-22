class CardColorSwitcher {
  constructor() {
    this.options = {
      activeClass: "active",
      sessionStorageCardProduct: "cardProductData",
      templateImagesParam: "?view=card-product",
    };

    this.registerEvents();
  }

  registerEvents() {
    document.addEventListener("color-swatches-loaded", () => {
      this.onColorSwatchClickListener();
    });
  }

  onColorSwatchClickListener() {
    const colorImages = document.querySelectorAll(
      "card-color-swatch.is-loaded .product-variant__color:not(.active)",
    );

    colorImages.forEach((colorImage) => {
      if (colorImage.dataset.availableColor === "true") return;

      colorImage.addEventListener(
        "click",
        async (e) => {
          e.preventDefault();

          const cardWrapper = e.target.closest(".card-wrapper");
          cardWrapper.classList.add("is-loading");

          const productUrl = e.target.getAttribute("href").split("?")[0],
            productData = this.getCachedCards();

          if (productData[productUrl]) {
            const productCardHtml = productData[productUrl];

            this.changeProductCard(cardWrapper, productCardHtml);
          } else {
            const productCardHtml = await this.getProductCard(productUrl),
              loadedCardProduct = this.getCardProductElement(productCardHtml);

            productData[productUrl] = loadedCardProduct?.outerHTML ?? "";

            this.saveCardToCache(productData);

            this.changeProductCard(cardWrapper, loadedCardProduct);
          }

          cardWrapper.classList.remove("is-loading");

          document.dispatchEvent(new CustomEvent("card-product-loaded"));
        },
        { once: true },
      );

      colorImage.dataset.availableColor = "true";
    });
  }

  getCachedCards() {
    let cachedData = sessionStorage.getItem(
      this.options.sessionStorageCardProduct,
    );

    return cachedData ? JSON.parse(cachedData) : {};
  }

  saveCardToCache(productData) {
    sessionStorage.setItem(
      this.options.sessionStorageCardProduct,
      JSON.stringify(productData),
    );
  }

  async getProductCard(productUrl) {
    const url = `${productUrl}${this.options.templateImagesParam}`;

    try {
      const response = await fetch(url);
      const responseText = await response.text();

      return new DOMParser().parseFromString(responseText, "text/html");
    } catch (e) {
      console.error(e);
    }
  }

  getCardProductElement(productCardHtml) {
    return (
      productCardHtml.querySelector(".card-wrapper")?.cloneNode(true) ?? null
    );
  }

  changeProductCard(cardWrapper, loadedCardProduct) {
    let styles = cardWrapper.getAttribute("style");

    if (styles) {
      styles += `; min-width: ${cardWrapper.offsetWidth}px`;
    }

    if (loadedCardProduct instanceof HTMLElement) {
      if (styles) {
        loadedCardProduct.setAttribute("style", styles);
      }

      cardWrapper?.replaceWith(loadedCardProduct);
    } else {
      const tempElement = document.createElement("div");

      tempElement.innerHTML = loadedCardProduct;
      const element = tempElement.firstElementChild;

      if (styles) {
        element.setAttribute("style", styles);
      }

      cardWrapper?.replaceWith(element);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new CardColorSwitcher());
