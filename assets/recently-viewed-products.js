if (!customElements.get("recently-viewed")) {
  customElements.define(
    "recently-viewed",
    class RecentlyViewedElement extends HTMLElement {
      constructor() {
        super();

        this.options = {
          recentlyViewedCookieName: "recentlyViewedProducts",
          templateParam: "?view=card-product",
          templateCardDrawerParam: "?view=card-product-drawer-template",
          targetContainer: ".recently-viewed-products",
        };

        this.body = document.body;
        this.currentLanguage = document.documentElement.lang;
        this.targetContainer = this.querySelector(this.options.targetContainer);
        this.template = this.dataset.desktopOffcanvas
          ? this.options.templateCardDrawerParam
          : this.options.templateParam;

        this.recentlyViewedProductsCookie = this.getCookieItem(
          this.options.recentlyViewedCookieName,
        );

        this.recentlyViewedAllProducts = this.recentlyViewedProductsCookie
          ? JSON.parse(this.recentlyViewedProductsCookie)
          : {};

        this.recentlyViewedProducts =
          this.recentlyViewedAllProducts[this.currentLanguage];

        if (!this.recentlyViewedProducts) return;

        this.renderRecentlyViewedProducts();
      }

      async renderRecentlyViewedProducts() {
        await this.fetchProducts();

        this.classList.remove("!hidden");
      }

      async fetchProducts() {
        const results = await Promise.all(
          this.recentlyViewedProducts.map((url, index) =>
            this.fetchProduct(url, index),
          ),
        );

        results.sort((a, b) => a.index - b.index);

        this.renderResults(results);

        document.dispatchEvent(
          new CustomEvent("recently-viewed-products-loaded"),
        );
      }

      async fetchProduct(url, index) {
        const productUrl = `${url}${this.template}`;

        try {
          const response = await fetch(productUrl);
          const responseText = await response.text();
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html",
          );
          const card_product = html.querySelector(".card-wrapper");

          if (card_product) {
            if (this.dataset.withoutImageSlider) {
              card_product
                .querySelector(".product-image-mobile")
                .classList.remove("lg:hidden");
              card_product
                .querySelector(".offcanvas-header-content .swiper")
                ?.remove();
            }

            card_product.classList.add("swiper-slide");

            return { index, card_product };
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      }

      renderResults(results) {
        results.forEach((result) => {
          if (result?.card_product) {
            this.targetContainer.insertAdjacentElement(
              "beforeend",
              result.card_product,
            );
          }
        });
      }

      getCookieItem(key) {
        if (!key) {
          return false;
        }

        const name = key + "=";
        const allCookies = document.cookie.split(";");

        for (let i = 0; i < allCookies.length; i++) {
          let singleCookie = allCookies[i];

          while (singleCookie.charAt(0) === " ") {
            singleCookie = singleCookie.substring(1);
          }

          if (singleCookie.indexOf(name) === 0) {
            return singleCookie.substring(name.length, singleCookie.length);
          }
        }

        return false;
      }
    },
  );
}
