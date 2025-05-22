if (!customElements.get("offcanvas-toggle-button")) {
  customElements.define(
    "offcanvas-toggle-button",
    class OffcanvasCardProduct extends HTMLElement {
      constructor() {
        super();

        if (
          !window.matchMedia("(max-width: 1023px)").matches &&
          this.closest("#product-grid")
        ) {
          return;
        }

        this.options = {
          isOpen: "is-open",
          offcanvasContent: ".offcanvas-content-wrapper",
          offcanvasProductCloned: "offcanvas-card-product-cloned",
          offcanvasClose: ".offcanvas-close",
        };

        this.scrollState = null;
        this.body = document.body;

        this.registerEvents();
      }
      registerEvents() {
        this.init();

        document.addEventListener("product-grid-updated", (event) => {
          this.loadedItems = event.detail;
          this.init();
        });

        document.addEventListener("product-collection-added", () => {
          const offcanvasCardItemOpened = document.querySelector(
            "offcanvas-item.is-open",
          );

          this.togglePanel(offcanvasCardItemOpened, false);
        });
      }

      init() {
        this.offcanvasToggleButton = this;
        this.openButtonClick(this.offcanvasToggleButton);
      }

      openButtonClick(button) {
        const card = button?.closest(".card"),
          offcanvasCardWrapper = card?.querySelector("offcanvas-item");

        if (!!offcanvasCardWrapper) {
          button.addEventListener("click", () => {
            this.onToggleButtonClick(offcanvasCardWrapper);
          });
        } else {
          button.addEventListener("click", () => {
            const cardTargetElement = button.closest(".card");

            let timerToShow = 0,
              targetOffcanvasWrapper =
                cardTargetElement.querySelector("offcanvas-item");

            if (!targetOffcanvasWrapper) {
              const targetElement = cardTargetElement.querySelector(
                  ".product-image-mobile",
                ),
                id = button.getAttribute("data-target-id"),
                item = this.loadedItems.find((item) => item.id === id);

              targetElement.insertAdjacentElement("afterend", item.element);
              document.dispatchEvent(new CustomEvent("card-product-loaded"));

              timerToShow = 25;
            }

            targetOffcanvasWrapper = targetOffcanvasWrapper
              ? targetOffcanvasWrapper
              : cardTargetElement.querySelector("offcanvas-item");

            setTimeout(() => {
              this.onToggleButtonClick(targetOffcanvasWrapper);
            }, timerToShow);
          });
        }
      }

      onToggleButtonClick(offcanvasCardItemWrapper) {
        const content = offcanvasCardItemWrapper?.querySelector(
          this.options.offcanvasContent,
        );
        const variants = content.getAttribute("data-variants-count");

        if (variants > 1) {
          this.togglePanel(offcanvasCardItemWrapper, true);

          const closeElements = document.body
            .querySelector(`.${this.options.offcanvasProductCloned}`)
            ?.querySelectorAll(this.options.offcanvasClose);

          closeElements?.forEach((item) =>
            item.addEventListener(
              "click",
              () => this.togglePanel(offcanvasCardItemWrapper, false),
              { once: true },
            ),
          );
        } else {
          this.querySelector(".loading__spinner")?.classList.remove("hidden");

          content.querySelector("[data-variant-id]").click();
        }
      }

      togglePanel(targetElement, state) {
        if (!targetElement) return;

        if (state) {
          if (
            document.body.querySelector(
              `.${this.options.offcanvasProductCloned}`,
            )
          )
            return;

          const clonedTarget = targetElement.cloneNode(true);

          clonedTarget.classList.add(this.options.isOpen);
          clonedTarget.classList.add(this.options.offcanvasProductCloned);
          this.scrollState = window.scrollY;
          document.querySelector("#MainContent").style.top =
            `-${this.scrollState}px`;
          document.body.appendChild(clonedTarget);
          document.dispatchEvent(new CustomEvent("card-product-loaded"));
        } else {
          if (
            !document.body.querySelector(
              `.${this.options.offcanvasProductCloned}`,
            )
          )
            return;

          document.body
            .querySelector(`.${this.options.offcanvasProductCloned}`)
            .remove();

          document.querySelector("html").style.scrollBehavior = "auto";
          document.querySelector("#MainContent").style.top = "";
          window.scrollTo(0, this.scrollState);
          this.scrollState = null;
          document.querySelector("html").style.scrollBehavior = "";
        }
      }
    },
  );
}
