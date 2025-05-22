class StickyHeader {
  constructor() {
    this.options = {
      mobileBreakpoint: "(max-width: 1023px)",
      header: ".section-header",
      searchModal: ".section-header .search-modal",
    };

    this.mobileBreakpoint = window.matchMedia(this.options.mobileBreakpoint);
    this.header = null;
    this.header = document.querySelector(this.options.header);
    this.headerHeight = this.header.offsetHeight;
    this.searchModal = document.querySelector(this.options.searchModal);
    this.searchModalHeight = this.mobileBreakpoint.matches
      ? this.searchModal.offsetHeight
      : 0;
    this.headerHeight = this.header.offsetHeight;

    this.setHeaderHeight();
    this.registerEvents();
  }

  registerEvents() {
    this.mobileBreakpoint.addEventListener(
      "change",
      this.setHeaderHeight.bind(this),
    );

    window.addEventListener("scroll", this.onScroll.bind(this));
  }

  onScroll() {
    this.header.classList[window.scrollY > 0 ? "add" : "remove"]("scrolled");
  }

  setHeaderHeight() {
    this.mobileBreakpoint.matches
      ? document.documentElement.style.setProperty(
          "--header-height-mobile",
          `${this.headerHeight + this.searchModalHeight}px`,
        )
      : document.documentElement.style.setProperty(
          "--header-height-desktop",
          `${this.headerHeight}px`,
        );
  }
}

document.addEventListener("DOMContentLoaded", () => new StickyHeader());
