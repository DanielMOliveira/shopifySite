class LocalizationFormPopup extends HTMLElement {
  constructor() {
    super();

    this.options = {
      cookieName: "languageSwitcherPopup",
      defaultLanguage: "en",
      active: "active",
      open: "language-switcher-open",
      form: ".shopify-localization-form",
      languageSwitcher: ".language-switcher",
      languageSwitcherOpenButton: ".language-switcher-open-button",
      languageSwitcherContent: ".language-switcher-content",
      languageSwitcherClose: ".language-switcher-close",
    };

    this.body = document.body;
    this.languageSwitcherPopup = document.querySelector(
      ".language-switcher-popup",
    );
    this.languageSwitcherClose = document.querySelectorAll(
      ".language-switcher-popup-close",
    );
    this.submitLanguageSwitcherBtn = document.querySelector(
      ".submit-language-switcher",
    );

    this.elements = {
      buttons: this.querySelectorAll("button.localization-form__select"),
      panels: this.querySelectorAll(".disclosure__list-wrapper"),
      lists: this.querySelectorAll(".disclosure__list"),
      countryInput: this.querySelector("input.popup-country-code"),
      languageInput: this.querySelector("input.popup-locale-code"),
      countryButton: this.querySelector(
        ".localization-country-selector .disclosure__button-content",
      ),
      languageButton: this.querySelector(
        ".localization-language-selector .disclosure__button-content",
      ),
    };

    this.registerEvents();
  }

  registerEvents() {
    this.checkCookie();

    this.languageSwitcherClose.forEach((el) => {
      el.addEventListener("click", () => {
        this.languageSwitcherPopup.classList.toggle("hidden");
        this.body.classList.remove("overflow-hidden");

        this.setCookieItem(this.options.cookieName, 0, 30);
      });
    });

    this.submitLanguageSwitcherBtn.addEventListener("click", () => {
      this.setCookieItem(
        this.options.cookieName,
        this.elements.languageInput.value.split("-")[0],
        30,
      );
    });

    if (this.classList.contains("localization-form-popup")) {
      this.checkSelectedCountry();

      if (!!this.elements.buttons) {
        this.elements.buttons.forEach((item) =>
          item.addEventListener("click", () => this.openSelector(item)),
        );
      }

      this.addListItemsClickTriggers();

      document.addEventListener("click", (event) => this.closeSelector(event));
    }
  }

  checkCookie() {
    if (!this.getCookieItem(this.options.cookieName)) {
      this.languageSwitcherPopup.classList.toggle("hidden");
      this.body.classList.add("overflow-hidden");
    }
  }

  openSelector(item) {
    this.hidePanel();

    const panelWrapper = item
      .closest(".disclosure")
      .querySelector(".disclosure__list-wrapper");

    panelWrapper.toggleAttribute("hidden");
    item.setAttribute(
      "aria-expanded",
      (item.getAttribute("aria-expanded") === "false").toString(),
    );
  }

  closeSelector(event) {
    if (!event.target.closest(".disclosure")) {
      this.hidePanel();
    }
  }

  hidePanel() {
    this.elements.buttons.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
    this.elements.panels.forEach((panel) => {
      panel.setAttribute("hidden", true);
    });
  }

  addListItemsClickTriggers() {
    this.elements.lists.forEach((list) => {
      list.querySelectorAll(".disclosure__item").forEach((item) => {
        item.addEventListener("click", () => this.onListItemClick(item));
      });
    });
  }

  onListItemClick(item) {
    let wrapper = item.closest(".disclosure"),
      list = wrapper.querySelector(".disclosure__list"),
      input = wrapper.querySelector(`input[name="${list.dataset.target}"]`),
      buttonContent = wrapper.querySelector(".disclosure__button-content");

    if (list.classList.contains("countries")) {
      this.hideNotRelatedLanguages(item, buttonContent);
    }

    buttonContent.innerHTML = item.innerHTML;
    input.value = item.dataset.value;

    this.hidePanel();
  }

  hideNotRelatedLanguages(item) {
    const languageList = this.querySelector("#PopupLanguageList"),
      languageItems = languageList.querySelectorAll(".disclosure__item");

    languageItems.forEach((language) => {
      const isoCode = language.dataset.isoCode;
      language.classList.remove("hidden");

      if (
        isoCode !== item.dataset.isoCode &&
        isoCode !== this.options.defaultLanguage
      ) {
        language.classList.add("hidden");
      }
    });

    const visibleLanguages = languageList.querySelectorAll(
        ".disclosure__item:not(.hidden)",
      ),
      lastLanguage = visibleLanguages[visibleLanguages.length - 1];

    this.elements.languageInput.value = lastLanguage.dataset.value;
    this.elements.languageButton.innerHTML = lastLanguage.innerHTML;
  }

  checkSelectedCountry() {
    const selectedCountry = this.querySelector(".popup-country-code").value,
      countriesList = this.querySelector(".disclosure__list.countries"),
      selectedCountryItem = countriesList.querySelector(
        `[data-value="${selectedCountry}"]`,
      );

    if (selectedCountryItem) this.hideNotRelatedLanguages(selectedCountryItem);
  }

  setCookieItem(key, value, expirationDays) {
    if (typeof key === "undefined" || key === null) {
      throw new Error("You must specify a key to set a cookie");
    }

    const date = new Date();
    date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);

    let secure = "";
    if (location.protocol === "https:") {
      secure = "secure";
    }

    document.cookie = `${key}=${value};expires=${date.toUTCString()};path=/;sameSite=lax;${secure}`;
  }

  getCookieItem(key) {
    if (!key) {
      return false;
    }

    const name = key + "=";
    const allCookies = document.cookie.split(";");

    for (let i = 0; i < allCookies.length; i++) {
      let singleCookie = allCookies[i];

      while (singleCookie.charAt(0) === " ") {
        singleCookie = singleCookie.substring(1);
      }

      if (singleCookie.indexOf(name) === 0) {
        return singleCookie.substring(name.length, singleCookie.length);
      }
    }

    return false;
  }
}

customElements.define("localization-form-popup", LocalizationFormPopup);
