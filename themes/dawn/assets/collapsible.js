class Collapsible {
  constructor() {
    this.attr = "data-collapsible";
    this.mobile = window.matchMedia("(max-width: 768px)");
    document.addEventListener("DOMContentLoaded", this.init.bind(this));
  }

  init() {
    this.collapsibleItems = [...document.querySelectorAll(`[${this.attr}]`)];

    if (!this.collapsibleItems.length) return;

    this.collapsibleItems.forEach((collapsible) => {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.initCollapsible(collapsible);
              observer.unobserve(collapsible);
            }
          }
        },
        { rootMargin: "150px" },
      );

      observer.observe(collapsible);
    });
  }

  initCollapsible(collapsible) {
    const trigger = collapsible.querySelector("[data-trigger]");

    trigger.addEventListener("click", () => {
      const config = JSON.parse(
        collapsible.getAttribute(this.attr) || '{"collapsed":true}',
      );
      const mobileOnly = config.mobileOnly;
      const content = collapsible.querySelector("[data-content]");
      const icon = collapsible.querySelector(".icon-animation");

      if (mobileOnly && !this.mobile.matches) {
        return;
      }

      config.collapsed
        ? this.expandSection(content, config)
        : this.collapseSection(content, config);

      collapsible.setAttribute(this.attr, JSON.stringify(config));
      collapsible.classList[config.collapsed ? "remove" : "add"]("active");

      if (icon) {
        this.rotateIcon(icon, config.collapsed);
      }
    });
  }

  expandSection(content, config) {
    this.closeAll();

    content.style.height = `${content.scrollHeight}px`;
    config.collapsed = false;
  }

  collapseSection(content, config) {
    content.style.height = "0";
    config.collapsed = true;
  }

  closeAll(exceptCollapsible) {
    this.collapsibleItems.forEach((collapsible) => {
      if (collapsible !== exceptCollapsible) {
        const content = collapsible.querySelector("[data-content]");
        const icon = collapsible.querySelector(".chevron-right");
        const config = JSON.parse(
          collapsible.getAttribute(this.attr) || '{"collapsed":false}',
        );

        if (!config.collapsed) {
          content.style.height = "0";
          config.collapsed = true;
          collapsible.setAttribute(this.attr, JSON.stringify(config));

          if (icon) {
            this.rotateIcon(icon, config.collapsed);
          }
        }
      }
    });
  }

  rotateIcon(icon, collapsed) {
    icon.style.transform = collapsed ? "rotate(0deg)" : "rotate(180deg)";
  }
}

new Collapsible();
