class AccountNavigation {
  constructor() {
    this.mobile = window.matchMedia("(max-width: 768px)");
    this.selector = {
      header: ".header",
      headerSearch: ".header .search-modal",
    };
    this.attr = {
      id: "data-id",
      button: "data-nav-button",
      content: "data-nav-content",
    };
    this.contentPadding = 20;
    this.buttonsList = [];
    this.contentList = [];
    this.header = "";
    this.headerSearch = "";

    this.init();
    window.addEventListener("resize", () => this.updateMobileState());
  }

  init() {
    this.getElements();

    if (!this.buttonsList.length && !this.contentList) return;

    this.buttonsList.forEach((button) => {
      const contentArray = Array.from(this.contentList);

      let content = contentArray.find(
        (content) =>
          content.getAttribute(`${this.attr.id}`) ===
          button.getAttribute(`${this.attr.id}`),
      );

      if (this.mobile.matches) {
        this.initCollapsibleNavigation(button, content);
      } else {
        this.initDesktopNavigation(button, content);
      }
    });
  }

  updateMobileState() {
    const wasMobile = this.isMobile;
    this.isMobile = this.mobile.matches;
    if (this.isMobile !== wasMobile) {
      this.init();
    }
  }

  getElements() {
    this.buttonsList = [...document.querySelectorAll(`[${this.attr.button}]`)];
    this.contentList = [...document.querySelectorAll(`[${this.attr.content}]`)];
    this.header = document.querySelector(this.selector.header);
    this.headerSearch = document.querySelector(this.selector.headerSearch);
  }

  initDesktopNavigation(button, content) {
    button.onclick = (e) => {
      e.preventDefault();

      this.buttonsList.forEach((content) => {
        content.classList.remove("active");
      });

      this.contentList.forEach((content) => {
        content.classList.add("hidden");
      });

      button.classList.add("active");
      content.classList.remove("hidden");
    };
  }

  initCollapsibleNavigation(button, content) {
    button.onclick = (e) => {
      e.preventDefault();

      let collapsed = button.getAttribute(`${this.attr.button}`) === "true";
      this.closeAll(button, content);

      collapsed = !collapsed;

      button.setAttribute(`${this.attr.button}`, collapsed.toString());

      button.classList[collapsed ? "add" : "remove"]("open");

      collapsed
        ? this.expandSection(button, content)
        : this.collapseSection(content);
    };
  }

  expandSection(button, content) {
    content.classList.remove("hidden");
    this.scrollToButton(button);
  }

  collapseSection(content) {
    content.classList.add("hidden");
  }

  scrollToButton(button) {
    let buttonPosition = button.offsetTop;
    window.scrollTo({
      top: buttonPosition,
    });
  }

  closeAll(exceptButton, exceptContent) {
    this.buttonsList.forEach((button) => {
      if (button !== exceptButton) {
        button.classList.remove("open");
        button.setAttribute(`${this.attr.button}`, "false");
      }
    });

    this.contentList.forEach((content) => {
      if (content !== exceptContent) {
        content.classList.add("hidden");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new AccountNavigation());
