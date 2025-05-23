if (!customElements.get("product-form")) {
  customElements.define(
    "product-form",
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector("form");
        this.variantIdInput.disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.cart =
          document.querySelector("cart-notification") ||
          document.querySelector("cart-drawer");
        this.submitButtons = document.querySelectorAll(
          '.main-product [type="submit"]',
        );
        this.variantsOpener = document.querySelectorAll("[data-open-swatches]");

        if (document.querySelector("cart-drawer"))
          this.submitButtons.forEach((btn) =>
            btn.setAttribute("aria-haspopup", "dialog"),
          );

        this.hideErrors = this.dataset.hideErrors === "true";

        document.addEventListener("product-info:swatch-selected", () => {
          const mobSwatches = document.querySelectorAll("[data-swatches]");

          if (!mobSwatches.length) return;

          mobSwatches.forEach((el) => el.classList.remove("!translate-y-0"));
        });
      }

      noVariantSelected() {
        const noVariantSelected = document.querySelector(
          ".variants-not-applied",
        );
        const variantsOpener = document.querySelectorAll(
          "[data-open-swatches]",
        );

        return (
          noVariantSelected && variantsOpener.length && window.innerWidth < 768
        );
      }

      openVariants() {
        for (const variantOpener of this.variantsOpener) {
          const parent = variantOpener.closest("fieldset");
          const variantOverlaySelected = parent.querySelector(
            "[data-swatches]:has(input:checked)",
          );

          if (!variantOverlaySelected) {
            variantOpener.click();
            break;
          }
        }
      }

      onSubmitHandler(evt) {
        const currentButton = evt.target.querySelector('[type="submit"]');

        evt.preventDefault();

        if (this.noVariantSelected()) {
          this.openVariants();
          return;
        }

        if (
          evt.target
            .querySelector('[type="submit"]')
            .getAttribute("aria-disabled") === "true"
        )
          return;

        this.handleErrorMessage();

        this.submitButtons.forEach((btn) => {
          btn.setAttribute("aria-disabled", true);
          this.querySelector(".loading__spinner").classList.remove("hidden");
        });

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

              const soldOutMessage =
                currentButton.querySelector(".sold-out-message");

              if (!soldOutMessage) return;

              this.submitButtons.forEach((btn) =>
                btn.setAttribute("aria-disabled", true),
              );

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
            const quickAddModal = this.closest("quick-add-modal");
            if (quickAddModal) {
              document.body.addEventListener(
                "modalClosed",
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true },
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }

            document.dispatchEvent(
              new CustomEvent("single-product-add-to-cart", {
                detail: {
                  element: this.form,
                  response: response,
                },
              }),
            );
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            if (this.cart && this.cart.classList.contains("is-empty"))
              this.cart.classList.remove("is-empty");
            if (!this.error) {
              this.submitButtons.forEach((btn) => {
                btn.removeAttribute("aria-disabled");
              });
            }
            this.querySelector(".loading__spinner").classList.add("hidden");
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

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButtons.forEach((btn) => {
            btn.setAttribute("disabled", "disabled");

            if (text) btn.querySelector("span[data-text]").textContent = text;
          });
        } else {
          this.submitButtons.forEach((btn) => {
            btn.removeAttribute("disabled", "disabled");
            btn.querySelector("span[data-text]").textContent =
              window.variantStrings.addToCart;
          });
        }
      }

      get variantIdInput() {
        return this.form.querySelector("[name=id]");
      }
    },
  );
}
