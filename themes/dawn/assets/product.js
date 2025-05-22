class Product {
  constructor() {
    this.options = {
      activeClass: "active",
      productInfoSelector: 'section[id^="ProductInfo"]',
      copyTextSelector: "[data-copy]",
      collapsibleSelector:
        ".main-product [data-pdp-collapsible] [data-trigger]",
      buyButtonsSelector: "product-info .buy-buttons",
      buyButtonsStickySelector: ".main-product .buy-buttons-sticky",
      triggerOpenSwatches: "[data-open-swatches]",
      triggerCloseSwatches: "[data-close-swatches]",
      swatches: "[data-swatches]",
      anchor: "[data-anchor]",
    };

    this.eventListener();
    this.initStickyProductInfo();
    this.initCollapsible();
    this.initSwatches();
    this.initStickyBuyButtons();
  }

  eventListener() {
    const copyElements = document.querySelectorAll(
      this.options.copyTextSelector,
    );
    const anchors = document.querySelectorAll("[data-anchor]");

    if (copyElements.length) {
      copyElements.forEach((element) => {
        element.addEventListener("click", async () => {
          try {
            const text = element.getAttribute("data-copy-text");

            await navigator.clipboard.writeText(text);
            element.classList.add(this.options.activeClass);

            setTimeout(
              () => element.classList.remove(this.options.activeClass),
              3000,
            );
          } catch (err) {
            console.error(`Failed to copy: ${err}`);
          }
        });
      });
    }

    if (anchors.length) {
      anchors.forEach((anchor) => {
        anchor.addEventListener("click", (e) => {
          e.preventDefault();

          const id = anchor.getAttribute("href");
          const elToScroll = document.querySelector(id);

          if (!elToScroll) {
            console.warn(`No such element with id: ${id}`);
            return;
          }

          elToScroll.querySelector('[data-tab="description"]')?.click();
          window.scroll({ top: elToScroll.offsetTop, behavior: "smooth" });
        });
      });
    }

    document.addEventListener("variant-selects-updated", () =>
      this.initSwatches(),
    );
  }

  initStickyProductInfo() {
    const productInfo = document.querySelector(
      this.options.productInfoSelector,
    );

    if (!productInfo) return;

    let productInfoHeight = productInfo.offsetHeight,
      screenHeight = window.innerHeight,
      startScroll = parseInt(window.getComputedStyle(productInfo).top, 10),
      endScroll = window.innerHeight - productInfoHeight,
      currPos = window.scrollY;

    productInfo.style.top = `${startScroll}px`;

    const productInfoResizeListener = () => {
      productInfoHeight = productInfo.offsetHeight;
      screenHeight = window.innerHeight;
    };

    const productInfoScrollListener = () => {
      productInfoHeight = productInfo.offsetHeight;

      if (productInfoHeight <= screenHeight) {
        productInfo.style.top = `${startScroll}px`;

        return;
      }

      endScroll = window.innerHeight - productInfo.offsetHeight;

      let productInfoTop = parseInt(productInfo.style.top, 10);

      if (productInfoHeight > screenHeight) {
        if (window.scrollY < currPos) {
          if (productInfoTop < startScroll) {
            productInfo.style.top = `${productInfoTop + currPos - window.scrollY}px`;
          } else if (
            productInfoTop >= startScroll &&
            productInfoTop !== startScroll
          ) {
            productInfo.style.top = `${startScroll}px`;
          }
        } else {
          if (productInfoTop > endScroll) {
            productInfo.style.top = `${productInfoTop + currPos - window.scrollY}px`;
          } else if (
            productInfoTop < endScroll &&
            productInfoTop !== endScroll
          ) {
            productInfo.style.top = `${endScroll}px`;
          }
        }
      }

      currPos = window.scrollY;
    };

    window.addEventListener("resize", productInfoResizeListener);
    window.addEventListener(
      "scroll",
      () => {
        if (window.innerWidth >= 768) productInfoScrollListener();
      },
      { capture: true, passive: true },
    );
  }

  initCollapsible() {
    const triggers = document.querySelectorAll(
      this.options.collapsibleSelector,
    );

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const content = trigger.parentElement.querySelector("[data-content]");

        content.parentElement.classList[
          content.classList.contains("!hidden") ? "add" : "remove"
        ]("active");
        content.classList[
          content.classList.contains("!hidden") ? "remove" : "add"
        ]("!hidden");
      });
    });
  }

  initSwatches() {
    const triggerOpenSwatches = document.querySelectorAll(
      this.options.triggerOpenSwatches,
    );
    const triggerCloseSwatches = document.querySelectorAll(
      this.options.triggerCloseSwatches,
    );

    triggerOpenSwatches.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const swatches = trigger.parentElement.querySelector(
          this.options.swatches,
        );

        swatches.classList.add("!translate-y-0");
      });
    });

    triggerCloseSwatches.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const swatches = trigger
          .closest("fieldset")
          .querySelector(this.options.swatches);

        swatches.classList.remove("!translate-y-0");
      });
    });
  }

  initStickyBuyButtons() {
    const buyButtonsSticky = document.querySelector(
      this.options.buyButtonsStickySelector,
    );

    if (!buyButtonsSticky) return;

    const footer = document.querySelector("footer");

    footer.style.cssText = `padding-bottom: ${buyButtonsSticky.offsetHeight}px`;
  }
}

document.addEventListener("DOMContentLoaded", () => new Product());
