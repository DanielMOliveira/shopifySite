if (!customElements.get("recently-viewed-cookie")) {
  customElements.define(
    "recently-viewed-cookie",
    class RecentlyViewedCookie extends HTMLElement {
      constructor() {
        super();

        this.options = {
          recentlyViewedCookieName: "recentlyViewedProducts",
          targetElementWithProductUrl: "product-info",
        };
        this.body = document.body;
        this.currentLanguage = document.documentElement.lang;

        this.registerEvents();
      }

      registerEvents() {
        if (this.body.classList.contains("product")) {
          this.addProductToRecentlyViewed();
        }
      }

      addProductToRecentlyViewed() {
        const productInfoWrapper = document.querySelector(
            this.options.targetElementWithProductUrl,
          ),
          productUrl = productInfoWrapper.dataset.url;

        this.updateCookie(productUrl);
      }

      updateCookie(currentProductUrl) {
        const existingProducts = this.getCookieItem(
          this.options.recentlyViewedCookieName,
        );

        let recentlyViewedData = existingProducts
          ? JSON.parse(existingProducts)
          : {};

        if (!recentlyViewedData[this.currentLanguage]) {
          recentlyViewedData[this.currentLanguage] = [];
        }

        let recentlyViewedArray = recentlyViewedData[this.currentLanguage];

        recentlyViewedArray = recentlyViewedArray.filter(
          (link) => link !== currentProductUrl,
        );

        recentlyViewedArray.unshift(currentProductUrl);

        if (recentlyViewedArray.length > this.dataset.recentlyViewedCount) {
          recentlyViewedArray.pop();
        }

        recentlyViewedData[this.currentLanguage] = recentlyViewedArray;

        this.setCookieItem(
          this.options.recentlyViewedCookieName,
          JSON.stringify(recentlyViewedData),
          30,
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
    },
  );
}
