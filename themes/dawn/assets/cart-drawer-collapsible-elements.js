if (!customElements.get("collapsible-elements")) {
  customElements.define(
    "collapsible-elements",
    class CollapsibleElements extends HTMLElement {
      constructor() {
        super();

        this.options = {
          collapsibleItem: "[data-collapsible-item]",
          collapsibleHeader: "[data-collapsible-trigger]",
          collapsibleContent: "[data-collapsible-content]",
          openClass: "open",
        };

        this.headers = this.querySelectorAll(this.options.collapsibleHeader);

        this.registerEvents();
      }

      registerEvents() {
        this.headers.forEach((header) => {
          header.addEventListener("click", () => {
            const item = header.parentElement;
            const content = item.querySelector(this.options.collapsibleContent);

            if (content.classList.contains(this.options.openClass)) {
              content.classList.remove(this.options.openClass);
              return;
            }

            document
              .querySelectorAll(this.options.collapsibleContent)
              .forEach((contentElement) => {
                contentElement.classList.remove(this.options.openClass);
              });

            content.classList.toggle(this.options.openClass);
          });
        });
      }
    },
  );
}
