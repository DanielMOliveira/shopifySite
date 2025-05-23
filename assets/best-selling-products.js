if (!customElements.get("cart-drawer-best-selling")) {
  customElements.define(
    "cart-drawer-best-selling",
    class cartDrawerBestSelling extends HTMLElement {
      constructor() {
        super();

        this.options = {
          templateParam: "view=slider-items-card-products",
          targetContainer: ".best-selling-products",
        };

        this.targetContainer = this.querySelector(this.options.targetContainer);

        if (this.targetContainer.children.length) return;

        this.getProducts();
      }

      getProducts() {
        const language =
          this.dataset.rootUrl == "/" ? "" : this.dataset.rootUrl;

        fetch(
          `${language}/collections/all?sort_by=best-selling&${this.options.templateParam}`,
        )
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(
              responseText,
              "text/html",
            );

            const products = html.querySelectorAll(
              "#slider-items-card-products .card-wrapper",
            );

            this.renderResults(products);

            document.dispatchEvent(
              new CustomEvent("cart-drawer-best-selling-loaded"),
            );
          })

          .finally(() =>
            document.dispatchEvent(
              new CustomEvent("cart-drawer-best-selling-loaded"),
            ),
          );
      }

      renderResults(products) {
        products.forEach((product) => {
          product.classList.add("swiper-slide");

          this.targetContainer.insertAdjacentElement("beforeend", product);
        });

        this.classList.remove("!hidden");
      }
    },
  );
}
