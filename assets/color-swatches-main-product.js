if (!customElements.get("product-color-swatches")) {
  customElements.define(
    "product-color-swatches",
    class mainProductColorSwatches extends HTMLElement {
      constructor() {
        super();

        this.element = this;
        this.colorCode = this.element.dataset.colorCode;

        this.fetchAndGetProducts().then((color_swatches) => {
          this.renderResults(color_swatches);
        });
      }

      async fetchAndGetProducts() {
        const uniqueColorSwatches = {};
        const collections = this.dataset.productCollections.split(",");

        try {
          const fetchPromises = collections.map(async (collection) => {
            const url = `${window.location.origin}${collection}?filter.p.m.custom.refdesign=${this.colorCode}&view=product-color-swatch-variants`;

            try {
              const response = await fetch(url);

              if (!response.ok) {
                throw new Error("Error fetching data");
              }

              const responseText = await response.text();
              const html = new DOMParser().parseFromString(
                responseText,
                "text/html",
              );
              const colorSwatches = html.querySelectorAll(
                ".product-variant__color",
              );

              colorSwatches.forEach((swatch, index) => {
                if (
                  this.element.dataset.colorCode == swatch.dataset.colorCode
                ) {
                  uniqueColorSwatches[index] = swatch;
                }
              });
            } catch (error) {
              console.error("Error", error);
            }
          });

          await Promise.allSettled(fetchPromises);

          return Object.values(uniqueColorSwatches);
        } catch (error) {
          throw error;
        }
      }

      renderResults(color_swatches) {
        if (!color_swatches.length) return;

        const currentColorUrl = this.element.dataset.colorCurrentUrl;

        color_swatches.forEach((swatch) => {
          if (swatch.dataset.url === currentColorUrl) {
            swatch.classList.add("active");
          }
          this.element.insertAdjacentElement("beforeend", swatch);
        });

        if (this.element.querySelector(".color-loader")) {
          this.element.querySelector(".color-loader").remove();
        }
      }
    },
  );
}
