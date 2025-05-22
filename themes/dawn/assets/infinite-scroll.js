class InfiniteScroll {
  constructor() {
    this.options = {
      loadingClass: "loading",
      containerSelector: ".container",
      paginationSelector: ".pagination",
      collectionPagination: ".collection-pagination",
      itemsContainerSelector: ".items",
    };

    const attr = "data-infinite-scroll";
    const el = document.querySelector(`[${attr}]`);

    if (!el) return;

    const passedOptions = JSON.parse(el.getAttribute(attr) || {});

    this.options = { ...this.options, ...passedOptions };
    this.body = document.body;
    this.offcanvasItems = [];

    this.registerEvents();
  }

  registerEvents() {
    this.init();

    document.addEventListener("product-grid-updated", () => {
      this.init();
    });
  }

  init() {
    this.container = document.querySelector(this.options.containerSelector);
    this.pagination = document.querySelector(this.options.paginationSelector);
    this.collectionPagination = document.querySelector(
      this.options.collectionPagination,
    );
    this.itemsContainer = document.querySelector(
      this.options.itemsContainerSelector,
    );

    if (!this.pagination) return;

    this.collectionPagination.addEventListener("click", (e) => {
      e.preventDefault();

      if (!this.pagination.classList.contains("is-loaded")) {
        this.pagination.classList.add("is-loaded");

        this.load(this.pagination.dataset.page);
      }
    });
  }

  toggleLoader(state) {
    this.container.classList[state ? "add" : "remove"](
      this.options.loadingClass,
    );
  }

  async load(currentPage) {
    let href = "";
    const nextPageIterator = parseInt(currentPage, 10) + 1;
    const nextPageElement = this.pagination.querySelector(
      `a[href*="page=${nextPageIterator}"]`,
    );

    if (!nextPageElement && !nextPageElement?.href) return;

    this.toggleLoader(true);

    await fetch(nextPageElement.href)
      .then((response) => response.text())
      .then((response) => {
        const html = new DOMParser().parseFromString(response, "text/html");

        let updatedItems = html.querySelector(
          this.options.itemsContainerSelector,
        );

        const mobileElements = updatedItems.querySelectorAll("offcanvas-item");

        if (window.matchMedia("(max-width: 1023px)").matches) {
          mobileElements.forEach((element) => {
            const id = element.getAttribute("data-id");
            this.offcanvasItems.push({ id: id, element: element });

            element.remove();
          });
        }

        const updatedPagination = html.querySelector(
          this.options.paginationSelector,
        );

        let loadedItems = [];

        this.itemsContainer.insertAdjacentHTML(
          "beforeend",
          updatedItems.innerHTML,
        );

        [...updatedItems.children].forEach((article) => {
          loadedItems.push(article);
        });

        this.pagination.parentElement.append(updatedPagination);
        this.pagination.remove();

        this.toggleLoader(false);
        this.init();

        document.dispatchEvent(
          new CustomEvent("product-grid-updated", {
            detail: this.offcanvasItems,
          }),
        );

        document.dispatchEvent(
          new CustomEvent("datalayer-pagination-products", {
            detail: loadedItems,
          }),
        );
      })
      .catch((error) => {
        console.error(error);
        this.toggleLoader(false);
      });
  }
}

document.addEventListener("DOMContentLoaded", () => new InfiniteScroll());
