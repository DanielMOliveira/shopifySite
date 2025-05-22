class ProductGallery {
  constructor() {
    this.options = {
      hiddenClass: "-translate-x-full",
      isModalGalleryInitialized: false,
      mainGallerySelector: '[id^="GalleryViewer-"]',
      modalGallerySelector: '[id^="ProductModal-"]',
    };

    this.mainGallery = document.querySelector(this.options.mainGallerySelector);
    this.modalGallery = document.querySelector(
      this.options.modalGallerySelector,
    );

    this.eventListener();
  }

  eventListener() {
    this.mainGallery
      .querySelectorAll(".swiper-slide")
      .forEach((slide, index) => {
        slide.addEventListener("click", () => {
          const modalSliderInstance = this.modalGallery.swiper;

          if (!modalSliderInstance) return;

          modalSliderInstance.slideTo(index);
          setTimeout(() => {
            this.pauseVideos(this.mainGallery);
            this.toggleModalGallery(true);
          }, modalSliderInstance.params.speed || 300);

          if (!this.isModalGalleryInitialized) {
            this.isModalGalleryInitialized = true;
            this.initZoom();
          }
        });
      });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" || event.key === "Esc") {
        this.pauseVideos(this.modalGallery);
        this.toggleModalGallery(false);
      }
    });

    this.modalGallery.parentElement
      .querySelector("[data-close]")
      .addEventListener("click", () => {
        this.pauseVideos(this.modalGallery);
        this.toggleModalGallery(false);
      });
  }

  toggleModalGallery(state) {
    this.modalGallery.parentElement.classList[state ? "remove" : "add"](
      this.options.hiddenClass,
    );
    document.body.style.cssText = state ? "overflow: hidden" : "";
  }

  initZoom() {
    if (!window.ZoomistUrl) return;

    const zoomistScript = document.createElement("script");

    zoomistScript.src = window.ZoomistUrl;
    document.body.append(zoomistScript);

    this.waitForZoomist(() => {
      const elements = this.modalGallery.querySelectorAll(".zoomist-container");

      elements.forEach((element) => new Zoomist(element));
    });
  }

  waitForZoomist(callback) {
    if (window.Zoomist) {
      callback();

      return;
    }

    setTimeout(() => this.waitForZoomist(callback), 100);
  }

  pauseVideos(gallery) {
    const shopifyVideos = gallery.querySelectorAll("video");
    const youtubeVideos = gallery.querySelectorAll("iframe.youtube-iframe");
    const vimeoVideos = gallery.querySelectorAll("iframe.vimeo-iframe");

    shopifyVideos.forEach((video) => video.pause());
    youtubeVideos.forEach((video) =>
      video.contentWindow.postMessage(
        '{"event":"command","func":"' + "pauseVideo" + '","args":""}',
        "*",
      ),
    );

    if (window.Vimeo && window.Vimeo.Player) {
      vimeoVideos.forEach((video) => {
        const player = new Vimeo.Player(video);

        player.pause();
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new ProductGallery());
