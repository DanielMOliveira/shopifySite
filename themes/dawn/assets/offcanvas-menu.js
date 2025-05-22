class OffcanvasMenu {
  constructor() {
    this.options = {
      active: "active",
      open: "open",
      hidden: "hidden",
      overflowHidden: "overflow-hidden",
      menuWrapper: "offcanvas-menu__wrapper",
      menu: "offcanvas-menu",
      menuItem: "offcanvas-menu__item",
      overlay: "offcanvas-menu__overlay",
      menuTrigger: "offcanvas-menu__trigger",
      menuItemTrigger: "offcanvas-menu__item-trigger",
      headerGroupSections: ".shopify-section-group-header-group",
      collectionHighlight: ".main-collections-highlights",
      subMenuBackButton: ".sub-menu--back",
      subMenuWithChildren: ".sub-menu-item.contain-sub-menu",
      searchModal: ".search-modal",
    };

    this.body = document.body;
    this.menuWrapper = document.querySelector(`.${this.options.menuWrapper}`);
    this.menu = document.querySelector(`.${this.options.menu}`);
    this.overlay = document.querySelector(`.${this.options.overlay}`);
    this.menuTriggers = document.querySelectorAll(
      `.${this.options.menuTrigger}`,
    );
    this.subParent = document.querySelectorAll(
      this.options.subMenuWithChildren,
    );
    this.menuBackBtns = document.querySelectorAll(
      this.options.subMenuBackButton,
    );
    this.headerGroupSections = document.querySelectorAll(
      this.options.headerGroupSections,
    );
    this.searchModal = document.querySelector(this.options.searchModal);
    this.media = window.matchMedia("(max-width: 1023px)");

    this.triggers = document.querySelectorAll(
      `.${this.options.menuWrapper} [data-target]`,
    );
    this.contents = document.querySelectorAll(
      `.${this.options.menuWrapper} div[id]`,
    );

    this.setOffcanvasTopPosition();
    this.registerEvents();
  }

  registerEvents() {
    this.subParent.forEach((subParent) => {
      subParent.addEventListener("click", () => this.toggleSubmenu(subParent));
    });

    this.menuBackBtns.forEach((sub_back) => {
      sub_back.addEventListener("click", (event) => {
        this.backSubmenu(event, sub_back);
      });
    });

    this.overlay.addEventListener("click", () => {
      this.body.classList.remove(this.options.overflowHidden);
      this.menuWrapper.classList.remove(this.options.active);
    });

    this.menuTriggers.forEach((menuTrigger) => {
      menuTrigger.addEventListener("click", () => {
        let isMenuActive = this.menuWrapper.classList.contains(
          this.options.active,
        );

        if (!isMenuActive) this.setOffcanvasTopPosition();

        this.body.classList[isMenuActive ? "remove" : "add"](
          this.options.overflowHidden,
        );
        this.menuWrapper.classList[isMenuActive ? "remove" : "add"](
          this.options.active,
        );
      });
    });

    this.tabSwitcher();
  }

  toggleSubmenu(subParent) {
    const parentMenu = subParent.closest(".sub-menu-item");
    const currentMenu = parentMenu.querySelector(".sub-menu");

    parentMenu.classList.add(this.options.open);
    currentMenu.classList.add(this.options.open);
  }

  backSubmenu(event, sub_back) {
    event.stopPropagation();

    const parentMenu = sub_back.closest(".sub-menu-item.open");
    const currentMenu = parentMenu.querySelector(".sub-menu.open");

    currentMenu.classList.remove(this.options.open);
    parentMenu.classList.remove(this.options.open);
  }

  tabSwitcher() {
    this.triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        let targetContent = document.querySelector(
          `#${trigger.dataset.target}`,
        );

        this.triggers.forEach((trigger) => {
          trigger.classList.remove(this.options.active);
        });

        this.contents.forEach((content) => {
          content.classList.add(this.options.hidden);
        });

        trigger.classList.add(this.options.active);
        targetContent.classList.remove(this.options.hidden);
      });
    });
  }

  setOffcanvasTopPosition() {
    let offcanvasMenuTopPosition = 0;
    let searchModalHeight = this.media.matches
      ? this.searchModal.offsetHeight
      : 0;

    if (!this.headerGroupSections.length) return;

    this.headerGroupSections.forEach((headerGroupSection) => {
      offcanvasMenuTopPosition =
        offcanvasMenuTopPosition +
        headerGroupSection.offsetHeight +
        searchModalHeight;
    });

    this.menu.style.top = `${offcanvasMenuTopPosition}px`;
    this.menu.style.height = `calc(100% - ${offcanvasMenuTopPosition}px)`;
    this.overlay.style.top = `${offcanvasMenuTopPosition}px`;
    this.overlay.style.height = `calc(100% - ${offcanvasMenuTopPosition}px)`;
  }
}

document.addEventListener("DOMContentLoaded", () => new OffcanvasMenu());
