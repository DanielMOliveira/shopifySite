class Modal {
  constructor() {
    this.options = {
      active: "active",
      closeBtnSelector: "[data-close]",
      triggerSelector: "[data-trigger-modal]",
      modalSelector: ".valantic-modal-wrapper",
    };

    this.init();
    this.registerEvents();
  }

  registerEvents() {
    document.addEventListener("variant-selects-updated", () => {
      this.init();
    });
  }

  init() {
    const triggers = document.querySelectorAll(
      `${this.options.triggerSelector}:not(.initialized)`,
    );

    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      trigger.classList.add("initialized");
      trigger.addEventListener("click", () => {
        const modalId = trigger.getAttribute(
          this.options.triggerSelector.replace(/[\[\]']+/g, ""),
        );
        const modal = document.getElementById(modalId);

        if (!modal) {
          console.error(
            `VALANTIC: CAN NOT FIND THE MODAL WITH THE ID: ${modalId}`,
          );

          return false;
        }

        modal.classList[
          modal.classList.contains(this.options.active) ? "remove" : "add"
        ](this.options.active);

        if (modal.classList.contains(this.options.active)) {
          const closeButtons = modal.querySelectorAll(
            this.options.closeBtnSelector,
          );

          modal.addEventListener("click", () =>
            modal.classList.remove(this.options.active),
          );
          modal.children[0].addEventListener("click", (e) =>
            e.stopPropagation(),
          );

          closeButtons.forEach((closeButton) =>
            closeButton.addEventListener("click", () =>
              modal.classList.remove(this.options.active),
            ),
          );
        }
      });
    });

    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" ||
        event.keyCode === 27 ||
        event.which === 27
      ) {
        document
          .querySelectorAll(this.options.modalSelector)
          .forEach((modal) => modal.classList.remove(this.options.active));
      }
    });
  }
}

new Modal();
