class SearchModal extends HTMLElement {
  constructor() {
    super();
    this.mobile = window.matchMedia("(max-width: 768px)");
    this.animationSpeed = 100;
    this.selector = {
      content: ".header__search [data-content]",
      trigger: ".header__search [data-trigger]",
      closeButton: ".header__search [data-close]",
      searchField: 'input.search__input[type="search"]',
      predictiveSearch: ".header__search predictive-search",
      header: ".section-header",
      headerMenu: ".offcanvas-menu__wrapper",
      searchActive: "search_active",
    };

    this.init();
  }

  init() {
    if (this.mobile.matches) {
      return false;
    }

    this.cacheDomElements();
    this.setupEventListeners();

    this.trigger.setAttribute("role", "button");
  }

  cacheDomElements() {
    this.content = this.querySelector(this.selector.content);
    this.trigger = this.querySelector(this.selector.trigger);
    this.closeButton = this.querySelector(this.selector.closeButton);
    this.headerMenu = document.querySelector(this.selector.headerMenu);
    this.header = document.querySelector(this.selector.header);
  }

  setupEventListeners() {
    this.content.addEventListener(
      "keyup",
      (event) => event.code.toUpperCase() === "ESCAPE" && this.close(),
    );
    this.trigger.addEventListener("click", this.onSummaryClick.bind(this));
    this.closeButton.addEventListener("click", this.close.bind(this));
  }

  isOpen() {
    return this.content.hasAttribute("open");
  }

  onSummaryClick(event) {
    event.preventDefault();
    const isOpen = this.content.hasAttribute("open");
    isOpen ? this.close() : this.open(event);
  }

  onBodyClick(event) {
    const clickOutside =
      !this.contains(event.target) ||
      event.target.classList.contains("modal-overlay");
    clickOutside ? this.close() : false;
  }

  open(event) {
    this.onBodyClickEvent =
      this.onBodyClickEvent || this.onBodyClick.bind(this);
    this.predictedSearch = this.querySelector(this.selector.predictiveSearch);
    event.target.closest(this.selector.content).setAttribute("open", true);
    document.body.addEventListener("click", this.onBodyClickEvent);
    document.body.classList.add("overflow-hidden");

    if (
      this.predictedSearch &&
      this.predictedSearch.getAttribute("results") === "true"
    ) {
      this.openPredictedSearch();
    }

    if (this.headerMenu && this.headerMenu.classList.contains("active")) {
      this.headerMenu.classList.remove("active");
    }

    this.header.classList.add(this.selector.searchActive);

    setTimeout(() => {
      trapFocus(
        this.content.querySelector('[tabindex="-1"]'),
        this.content.querySelector(this.selector.searchField),
      );
    }, this.animationSpeed);
  }

  close(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.trigger : null);
    this.content.removeAttribute("open");
    document.body.removeEventListener("click", this.onBodyClickEvent);
    document.body.classList.remove("overflow-hidden");
    this.header.classList.remove(this.selector.searchActive);
  }

  openPredictedSearch() {
    this.querySelector(this.selector.predictiveSearch).setAttribute(
      "open",
      true,
    );
  }
}

customElements.define("search-modal", SearchModal);
