"use strict";

class DataLayer {
  constructor(data = {}) {
    this.data = data;
    this.headerMenuLinks = null;
    this.selectors = {
      headerMenuLinks: ".header .menu #menu-list-1 a.sub-menu-link",
      headerMenuSubmenu: ".sub-menu-item",
      headerMenuSubmenuLink: ".sub-menu-link",
      searchInputs: "input[type='search']",
      newsletterForm: ".newsletter-form",
      logoutButtons: ".header-logout, .account .logout",
      banners: ".banner, .promo",
      promotions: [
        {
          element: ".top-notification",
          text: ".notification-text",
        },
        {
          element: ".promo",
          text: ".promo-text",
        },
      ],
    };
    this.dataLayer = window.dataLayer || [];

    if (!Object.keys(data).length) return;

    this.initData(this.data);
    this.getElements();
    this.bind();
    this.newsletterForm();
    this.loginOrRegister();
    this.logOut();
    this.bannersClick();
    this.outboundBannersClick();
    this.getAllErrors();
    this.promotionBanners();
    this.onSearchElementsClick();
  }

  async initData(data) {
    if (data.site) {
      data.site.mediaquery = this.getCurrentBreakpoint();
    }
    if (data.page) {
      this.page = data.page;
    }

    await this.getCookies();

    this.dataLayer.push(this.data);
  }

  getElements() {
    this.headerMenuLinks = document.querySelectorAll(
      this.selectors.headerMenuLinks,
    );
    this.allSearchInputs = document.querySelectorAll(
      this.selectors.searchInputs,
    );
    this.allSearchForms = Array.from(this.allSearchInputs).map(
      (input) => input.form,
    );
  }

  bind() {
    this.allSearchForms.forEach((form) => {
      form.addEventListener("submit", () => this.onSearchSubmit(form));
    });

    this.headerMenuLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavigationUse(e));
    });
  }

  resetEcommerce() {
    this.dataLayer.push({ ecommerce: null });
  }

  getCurrentBreakpoint() {
    const width = window.innerWidth;
    return width <= 600 ? "small" : width <= 960 ? "medium" : "large";
  }

  onSearchSubmit(form) {
    let searchQuery = form.querySelector(this.selectors.searchInputs)?.value;

    this.dataLayer.push({
      event: "search_use",
      search_action: "search",
      search_query: searchQuery,
    });
  }

  onSearchElementsClick() {
    document.addEventListener("predictive-search-rendered", () => {
      const searchLinks = document.querySelectorAll(
        ".predictive-search a[href]",
      );

      searchLinks.forEach((link) => {
        link.addEventListener("click", () => {
          let url = link.href;

          if (!url) return;

          url = new URL(link.href);

          this.dataLayer.push({
            event: "search_use",
            search_action: "search",
            search_query: url.pathname + url.search,
          });
        });
      });
    });
  }

  handleNavigationUse(e) {
    const hierarchy = this.getNavigationHierarchy(e.target);
    this.dataLayer.push({
      event: "navigation_use",
      navigation_text: hierarchy.text,
      navigation_level: hierarchy.level,
    });
  }

  getNavigationHierarchy(element) {
    let level = 0;
    let array = [];
    let currentElement = element.closest(this.selectors.headerMenuSubmenu);

    while (currentElement && currentElement.tagName !== "NAV") {
      if (
        currentElement.classList.contains(
          this.selectors.headerMenuSubmenu.replace(".", ""),
        )
      ) {
        level++;
        const linkText = currentElement
          .querySelector(this.selectors.headerMenuSubmenuLink)
          .textContent.trim();
        array.unshift(linkText);
      }
      currentElement = currentElement.parentNode;
    }

    return {
      text: array.join(" -> "),
      level,
    };
  }

  newsletterForm() {
    const newsletterForms = document.querySelectorAll(
      this.selectors.newsletterForm,
    );

    if (!newsletterForms.length) return;

    newsletterForms.forEach((form) => {
      let formId = form.getAttribute("data-layer");

      if (!form.getAttribute("data-layer")) return;

      form.addEventListener("submit", () => {
        this.dataLayer.push({
          event: "newsletter_subscription",
          formId: formId,
        });
      });
    });
  }

  logOut() {
    const logoutButtons = document.querySelectorAll(
      this.selectors.logoutButtons,
    );

    if (!logoutButtons.length) return;

    logoutButtons.forEach((button) => {
      button.addEventListener("click", () => {
        this.dataLayer.push({
          event: "logout",
          account_id: this.data.user.account_id,
        });
      });
    });
  }

  bannersClick() {
    const banners = document.querySelectorAll(this.selectors.banners);

    banners.forEach((banner) => {
      banner.addEventListener("click", (e) => {
        let classList = e.target?.className.replaceAll(" ", ".");
        this.dataLayer.push({
          event: "banner_click",
          banner_location: this.page,
          click_type: `${e.target?.tagName?.toLowerCase()}.${classList}`,
        });
      });
    });
  }

  outboundBannersClick() {
    let links = document.querySelectorAll("a[href][target=_blank]");

    links.forEach((link) => {
      link.addEventListener("click", () => {
        this.dataLayer.push({
          event: "outbound_banner_click",
          banner_location: this.page,
          click_type: link.tagName.toLowerCase(),
        });
      });
    });
  }

  getAllErrors() {
    const errors = document.querySelectorAll(".errors");
    const invalidInputs = document.querySelectorAll("[aria-invalid='true']");
    let errorMessages = [];

    if (!errors.length) return;

    invalidInputs.forEach((input) => {
      let label = input?.nextElementSibling?.innerText;

      label ? errorMessages.push(label) : false;
    });

    errors.forEach((error) => {
      let data = {
        event: "validation_message",
        validation_text: error.innerText,
        validation_field: errorMessages.join(", "),
      };

      this.dataLayer.push(data);
    });
  }

  promotionBanners() {
    this.selectors.promotions.forEach((promotions) => {
      const promotionElements = document.querySelectorAll(promotions.element);

      promotionElements.forEach((promotion) => {
        const promotionText = promotion.querySelector(promotions.text);

        if (!promotionText) return;

        this.getPromotionData(promotionText);

        promotion.addEventListener("click", () => {
          this.getPromotionData(promotionText);
        });
      });
    });
  }

  getPromotionData(promotionText) {
    const promotionId = promotionText.getAttribute("data-id");
    const text = promotionText.innerText
      .replace(/\n+/g, " ")
      .replace(" %", "%")
      .replace("  ", " ");

    this.resetEcommerce();
    this.dataLayer.push({
      event: "view_promotion",
      ecommerce: {
        promotion_id: promotionId,
        promotion_name: text,
      },
    });
  }

  async getCookies() {
    try {
      await this.waitForOneTrustToLoad();
      const cookies = window.Shopify?.customerPrivacy?.currentVisitorConsent();
      if (cookies) {
        this.setCookies(cookies);
      }
    } catch (error) {
      console.error("Error in getCookies:", error);
    }
  }

  waitForOneTrustToLoad() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 100;
      const interval = setInterval(() => {
        if (this.hasOneTrustLoaded()) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(
            new Error("OneTrust did not load within the expected time frame."),
          );
        }
        attempts++;
      }, 150);
    });
  }

  setCookies(cookies) {
    const {
      marketing,
      analytics,
      preferences,
      sale_of_data: saleOfData,
    } = cookies || {};

    this.data.consent = {
      essential: [marketing, analytics, preferences, saleOfData].every(
        this.checkCookieStatus,
      ),
      functional: this.checkCookieStatus(preferences),
      marketing: this.checkCookieStatus(marketing),
    };
  }

  hasOneTrustLoaded() {
    return typeof window.OnetrustActiveGroups === "string";
  }

  checkCookieStatus(cookie) {
    return cookie === "yes";
  }

  loginOrRegister() {
    const success = {
      login: "login",
      sign_up: "sign_up",
    };

    const currentUrl = new URL(window.location);
    const params = currentUrl.searchParams;

    for (const [key, value] of Object.entries(success)) {
      if (!window.location.search.includes(value)) continue;

      let dataLayer = window.dataLayer || [];
      let data = {
        event: value,
        account_id: this.data?.user?.account_id,
        account_type: "regular",
      };

      if (value === "login") data.organization_id = "-";

      dataLayer.push(data);

      params.delete(value);
      currentUrl.search = params.toString();
      window.history.pushState({}, "", currentUrl);
    }
  }
}
