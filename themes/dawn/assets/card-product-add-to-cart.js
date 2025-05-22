if (!customElements.get("card-product-add-to-cart")) {
  customElements.define(
    "card-product-add-to-cart",
    class CardProductAddToCartForm extends HTMLElement {
      constructor() {
        super();

        this.scrollState = window.scrollY;
        this.form = this.querySelector("form");

        this.variantButtons = this.querySelectorAll(
          ".product-form__variant-button",
        );
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");

        if (document.querySelector("cart-drawer")) {
          this.variantButtons.forEach((button) => {
            button.setAttribute("aria-haspopup", "dialog");
          });
        }

        this.hideErrors = this.dataset.hideErrors === "true";

        this.registerEvents();
      }

      registerEvents() {
        this.variantButtons.forEach((button) => {
          button.addEventListener("click", (event) =>
            this.onVariantButtonClick(event),
          );
        });
      }

      onVariantButtonClick(event) {
        const button = event.currentTarget;
        const variantId = button.dataset.variantId;

        this.variantButtons.forEach((btn) => btn.classList.remove("selected"));
        button.classList.add("selected");

        this.form.querySelector("[name=id]").value = variantId;

        this.onSubmitHandler(button);
      }

      onSubmitHandler(button) {
        if (button.getAttribute("aria-disabled") === "true") return;

        this.handleErrorMessage();

        button.setAttribute("aria-disabled", true);
        button.classList.add("loading");

        const config = fetchConfig("javascript");
        config.headers["X-Requested-With"] = "XMLHttpRequest";
        delete config.headers["Content-Type"];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            "sections",
            this.cart.getSectionsToRender().map((section) => section.id),
          );
          formData.append("sections_url", window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: "product-form",
                productVariantId: formData.get("id"),
                errors: response.errors || response.description,
                message: response.message,
              });

              this.handleErrorMessage(response.description);

              const soldOutMessage = button.querySelector(".sold-out-message");
              if (!soldOutMessage) return;
              button.setAttribute("aria-disabled", true);
              button.classList.add("hidden");
              soldOutMessage.classList.remove("hidden");
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }

            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: "product-form",
                productVariantId: formData.get("id"),
                cartData: response,
              });
            this.error = false;

            document.dispatchEvent(
              new CustomEvent("cart-product-added", {
                detail: {
                  element: button,
                  response: response,
                },
              }),
            );

            document.dispatchEvent(new CustomEvent("product-collection-added"));

            this.cart.renderContents(response);
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            button.classList.remove("loading");
            if (this.cart && this.cart.classList.contains("is-empty"))
              this.cart.classList.remove("is-empty");
            if (!this.error) button.removeAttribute("aria-disabled");

            document.querySelector("html").style.scrollBehavior = "auto";
            window.scrollTo(0, this.scrollState);
            this.scrollState = null;
            document.querySelector("html").style.scrollBehavior = "";
          });
      }

      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;

        this.errorMessageWrapper =
          this.errorMessageWrapper ||
          this.querySelector(".product-form__error-message-wrapper");
        if (!this.errorMessageWrapper) return;
        this.errorMessage =
          this.errorMessage ||
          this.errorMessageWrapper.querySelector(
            ".product-form__error-message",
          );

        this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      get variantIdInput() {
        return this.form.querySelector("[name=id]");
      }
    },
  );
}
