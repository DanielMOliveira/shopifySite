class CartRecommendedProducts {
  constructor() {
    this.options = {
      attr: "data-cart-recommended-products",
    };

    this.element = document.querySelector(`[${this.options.attr}]`);
    this.productIds = this.element.getAttribute(this.options.attr).split(",");
    this.sectionId = this.element.getAttribute("data-section-id");
    this.url = this.element.getAttribute("data-url");

    this.init();
  }

  async init() {
    for (const productId of this.productIds) {
      const response = await fetch(
        `${this.url}&product_id=${productId}&section_id=${this.sectionId}`,
      );
      const responseText = await response.text();
      const html = document.createElement("div");

      html.innerHTML = responseText;

      const recommendations = html.querySelector(
        `section[data-section-id="${this.sectionId}"]`,
      );

      if (!this.element.querySelector(".swiper-slide")) {
        this.element.innerHTML = recommendations.innerHTML;
      } else {
        const swiperWrapper = this.element.querySelector(
          ".swiper-wrapper-main",
        );
        const slides = recommendations.querySelectorAll(
          ".swiper-wrapper-main > .swiper-slide",
        );

        slides.forEach((slide) => swiperWrapper.append(slide));
      }
    }

    document.dispatchEvent(new Event("related-products-loaded"));
    setTimeout(() => this.element.classList.remove("hidden"), 1000);
  }
}

document.addEventListener(
  "DOMContentLoaded",
  () => new CartRecommendedProducts(),
);
