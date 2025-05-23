class LocalizationForm extends HTMLElement {
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

    this.form = this.querySelector(this.options.form);
    this.languageSwitcherWrapper = this.querySelector(
      this.options.languageSwitcher,
    );
    this.languageSwitcherInput = this.querySelector(
      'input[name="locale_code"]',
    );
    this.countrySwitcherInput = this.querySelector(
      'input[name="country_code"]',
    );
    this.languageSwitcherOpenButton = this.querySelector(
      this.options.languageSwitcherOpenButton,
    );
    this.closeElements = this.querySelectorAll(
      this.options.languageSwitcherClose,
    );

    this.registerEvents();
  }

  registerEvents() {
    if (!!this.languageSwitcherOpenButton) {
      this.languageSwitcherOpenButton.addEventListener("click", () =>
        this.togglePanel(true),
      );
    }

    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", (event) => this.onItemClick(event)),
    );

    if (!!this.closeElements) {
      this.closeElements.forEach((item) =>
        item.addEventListener("click", () => this.togglePanel(false)),
      );
    }
  }

  onItemClick(event) {
    event.preventDefault();

    this.countrySwitcherInput.value = event.currentTarget.dataset.countryCode;
    this.languageSwitcherInput.value = event.currentTarget.dataset.localeCode;

    this.setCookieItem(
      this.options.cookieName,
      this.languageSwitcherInput.value.split("-")[0],
      30,
    );

    if (this.form) this.form.submit();
  }

  togglePanel(state) {
    this.languageSwitcherWrapper.classList[state ? "add" : "remove"](
      this.options.open,
    );
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
}

customElements.define("localization-form", LocalizationForm);
