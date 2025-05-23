// Purpose: Infinite scroll with preloaded next page for Shopify

class InfiniteScrollPreloaded {
  constructor() {
    this.options = {
      loadingClass: "loading",
      loadingClassPreloaded: "loading-preloaded",
      containerSelector: ".container",
      paginationSelector: ".pagination",
      collectionPagination: ".collection-pagination",
    };

    const attr = "data-infinite-scroll";
    const el = document.querySelector(`[${attr}]`);

    if (!el) return;

    const passedOptions = JSON.parse(el.getAttribute(attr) || {});

    this.options = { ...this.options, ...passedOptions };
    this.body = document.body;
    this.offcanvasItems = [];

    this.preloadedHtml = null;

    this.registerEvents();
  }

  registerEvents() {
    this.init();

    document.addEventListener("product-grid-updated", () => {
      this.init();
    });

    this.preloadHtmlForNextPage();
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
        this.toggleLoader(true);

        this.pagination.classList.add("is-loaded");

        this.displayPreloadedHtml();
      }
    });
  }

  toggleLoader(state) {
    const loadingClass = this.preloadedHtml
      ? this.options.loadingClassPreloaded
      : this.options.loadingClass;

    this.container.classList.remove(this.options.loadingClass);
    this.container.classList[state ? "add" : "remove"](loadingClass);
  }

  async preloadHtmlForNextPage() {
    const currentPage = this.pagination.dataset.page;
    const nextPageIterator = parseInt(currentPage, 10) + 1;
    const nextPageElement = this.pagination.querySelector(
      `a[href*="page=${nextPageIterator}"]`,
    );

    if (!nextPageElement) return;

    let targetUrl = nextPageElement.href;
    if (!targetUrl.includes("view=card-products-infinity-scroll")) {
      targetUrl = targetUrl.includes("?")
        ? `${targetUrl}&view=card-products-infinity-scroll`
        : `${targetUrl}?view=card-products-infinity-scroll`;
    }

    try {
      const response = await fetch(targetUrl);
      const responseHtml = await response.text();

      this.preloadedHtml = new DOMParser().parseFromString(
        responseHtml,
        "text/html",
      );

      return this.preloadedHtml;
    } catch (error) {
      console.error(error);
    }
  }

  async displayPreloadedHtml() {
    if (!this.preloadedHtml) {
      this.preloadedHtml = await this.preloadHtmlForNextPage();
    }

    if (!this.preloadedHtml) return;

    let updatedItems = this.preloadedHtml.querySelector(
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

    const updatedPagination = this.preloadedHtml.querySelector(
      this.options.paginationSelector,
    );

    let loadedItems = [];

    this.itemsContainer.insertAdjacentHTML("beforeend", updatedItems.innerHTML);

    [...updatedItems.children].forEach((article) => {
      loadedItems.push(article);
    });

    this.pagination.parentElement.append(updatedPagination);
    this.pagination.remove();

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
    this.toggleLoader(false);

    this.preloadedHtml = null;

    this.preloadHtmlForNextPage();
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => new InfiniteScrollPreloaded(),
);
