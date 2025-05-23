class ListingView {
  constructor() {
    this.listingViewSelector = document.querySelector("[data-listing-view]");
    this.listingViewButtons = this.listingViewSelector.querySelectorAll(
      ".listing-view-selector__button",
    );

    this.registerEvents();
  }
  registerEvents() {
    this.changeView();

    document.addEventListener("product-grid-updated", () => {
      this.changeView();
    });
  }
  changeView() {
    const view = localStorage.getItem("listingView") || "grid";
    document.querySelector(`[data-view="${view}"]`).classList.add("is-active");
    document
      .querySelector("#product-grid")
      .setAttribute("data-listing-view", view);

    this.listingViewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.view;

        localStorage.setItem("listingView", view);
        document
          .querySelector("#product-grid")
          .setAttribute("data-listing-view", view);
        button.classList.add("is-active");

        this.listingViewButtons.forEach((btn) => {
          if (btn !== button) {
            btn.classList.remove("is-active");
          }
        });
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new ListingView());
