class Slider {
  constructor() {
    this.attr = "data-slider";
    this.attrPagination = "data-custom-pagination";
    this.init();
  }

  init() {
    const events = [
      "product-grid-updated",
      "related-products-loaded",
      "card-product-loaded",
      "recently-viewed-products-loaded",
      "cart-drawer-best-selling-loaded",
      "cart-drawer-rendered",
      "cart-after-update",
      "card-images-updated",
    ];
    this.initSliderEvent();

    events.forEach((event) => {
      document.addEventListener(event, () => this.initSliderEvent());
    });
  }

  initSliderEvent() {
    const sliders = document.querySelectorAll(`[${this.attr}]`);

    if (!sliders.length) return;

    sliders.forEach((slider) => {
      const rooMargin = slider.closest("#product-grid") ? "50px" : "250px";

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ isIntersecting }) => {
            if (isIntersecting) {
              if (
                !slider.classList.contains("swiper-initialized") &&
                !slider.classList.contains("deferred-init")
              ) {
                this.initSlider(slider);

                observer.unobserve(slider);
              } else {
                slider.addEventListener("mouseenter", () => {
                  if (!slider.classList.contains("swiper-initialized")) {
                    this.initSlider(slider);
                  }
                });
              }
            }
          });
        },
        { rootMargin: rooMargin },
      );

      observer.observe(slider);
    });
  }

  initSlider(slider) {
    if (!Swiper) return;

    let thumbsInstance;
    const config = JSON.parse(slider.getAttribute(this.attr) || "{}");

    if (config.thumbs && typeof config.thumbs.swiperSelector) {
      thumbsInstance = this.initThumbs(config.thumbs.swiperSelector);
      config.thumbs.swiper = thumbsInstance;
    }

    if (slider.getAttribute(this.attrPagination) === "true") {
      config.pagination = {
        el: ".swiper-custom-pagination",
        type: "custom",
        renderCustom: (swiper, current, total) => {
          return `<span>${current}</span><span>/</span><span>${total}</span>`;
        },
      };
    }

    const instance = new Swiper(slider, config);
    const classes = { begin: "slider-beginning", end: "slider-end" };

    if (instance.isBeginning) slider.classList.add(classes.begin);

    instance.on("slideChange", () => {
      if (instance.isBeginning) {
        slider.classList.add(classes.begin);
      } else {
        slider.classList.remove(classes.begin);
      }

      if (instance.isEnd) {
        slider.classList.add(classes.end);
      } else {
        slider.classList.remove(classes.end);
      }
    });
  }

  initThumbs(selector) {
    const thumbs = document.querySelector(selector);

    if (!thumbs) return false;

    const config = JSON.parse(thumbs.getAttribute(this.attr) || "{}");

    return new Swiper(thumbs, config);
  }
}

document.addEventListener("DOMContentLoaded", () => new Slider());
