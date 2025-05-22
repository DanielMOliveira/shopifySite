if (!customElements.get("card-color-swatch")) {
  customElements.define(
    "card-color-swatch",
    class cartColorSwatch extends HTMLElement {
      constructor() {
        super();
        this.options = {
          templateParam: "?view=card-product-template-only-color-swatches",
        };

        this.colorSwatch = this;
        this.targetProductUrl =
          this.getAttribute("data-product-url").split("?")[0];
        this.registerEvents();
      }

      registerEvents() {
        this.targetElement = this.colorSwatch;
        this.observer = new IntersectionObserver(
          this.handleIntersect.bind(this),
          {
            root: null,
            rootMargin: "200px",
            threshold: 0.1,
          },
        );

        this.observer.observe(this.targetElement);
      }

      handleIntersect(entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.getProduct();
            this.observer.unobserve(this.targetElement);
          }
        });
      }

      getProduct() {
        const url = `${this.targetProductUrl}${this.options.templateParam}`;

        fetch(url)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(
              responseText,
              "text/html",
            );
            const card_product = html.querySelector(".product-variant__colors");

            if (!!card_product) {
              this.colorSwatch.insertAdjacentHTML(
                "beforeend",
                card_product.innerHTML,
              );
            }
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            if (this.querySelector(".loading-skeleton")) {
              this.querySelector(".loading-skeleton").remove();
            }
          });
      }
    },
  );
}
