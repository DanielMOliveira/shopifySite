if (!customElements.get("breadcrumbs-list")) {
  customElements.define(
    "breadcrumbs-list",
    class BreadcrumbsList extends HTMLElement {
      constructor() {
        super();

        this.options = {
          menuList: ".menu-list",
          breadcrumbs: ".breadcrumbs",
          breadcrumbsContainer: ".breadcrumbs-list",
          breadcrumbsHome: ".breadcrumbs-home",
          breadcrumbsCollectionsItems: ".breadcrumb-collection-item",
          subMenuItem: ".sub-menu-item",
          subMenuLink: ".sub-menu-link",
          pageCollectionClass: "collection",
          pageProductClass: "product",
          collectionsUrl: "/collections",
          breadcrumbCollectionsData: "data-category-url",
        };

        this.body = document.body;
        this.localStorageCollectionPage = null;
        this.breadcrumbs = document.querySelector(this.options.breadcrumbs);
        this.menuLists = document.querySelectorAll(this.options.menuList);
        this.breadcrumbsContainer = document.querySelector(
          this.options.breadcrumbsContainer,
        );
        this.breadcrumbsCollectionsItems = document.querySelectorAll(
          this.options.breadcrumbsCollectionsItems,
        );
        this.locationLink = window.location.href;

        this.registerEvents();
      }
      registerEvents() {
        this.updateLocalStorageCollection();

        if (this.body.classList.contains(this.options.pageProductClass)) {
          this.updateProductBreadcrumb();
        }

        if (this.body.classList.contains(this.options.pageCollectionClass)) {
          this.updateCollectionBreadcrumb();
        }
      }

      updateProductBreadcrumb() {
        let breadcrumbs = null;

        const productCollectionUrlSegment = this.getProductCollectionUrl();
        const matchingLink = productCollectionUrlSegment
          ? this.findMenuLink(productCollectionUrlSegment)
          : null;

        if (!matchingLink) {
          if (this.localStorageCollectionPage) {
            breadcrumbs = [JSON.parse(this.localStorageCollectionPage)];

            this.renderBreadcrumbs(breadcrumbs, true);
          }

          this.breadcrumbs.classList.add("opacity-100");

          return;
        }

        breadcrumbs = this.buildBreadcrumbs(matchingLink);

        this.renderBreadcrumbs(breadcrumbs, true);
        this.breadcrumbs.classList.add("opacity-100");
      }

      updateCollectionBreadcrumb() {
        const breadcrumbs = this.buildBreadcrumbs(
          this.findMenuLink(this.locationLink),
        );

        this.renderBreadcrumbs(breadcrumbs);

        this.breadcrumbs.classList.add("opacity-100");
      }

      getProductCollectionUrl() {
        const referrer = document.referrer,
          breadcrumbData = this.breadcrumbs.getAttribute(
            this.options.breadcrumbCollectionsData,
          );

        if (referrer.includes(this.options.collectionsUrl)) {
          const collectionPath = referrer.split(this.options.collectionsUrl)[1];

          return this.options.collectionsUrl + collectionPath;
        } else if (breadcrumbData) {
          return breadcrumbData;
        }

        return false;
      }

      findMenuLink(segment) {
        if (segment === null) return;

        let links = [];

        this.menuLists.forEach((container) => {
          links = [...links, ...container.querySelectorAll(".sub-menu-link")];
        });

        links = links.filter(
          (link) =>
            link?.href?.split("/collections")[1] ===
            segment.split("/collections")[1],
        );

        if (links.length) return links[0];

        return false;
      }

      buildBreadcrumbs(linkElement) {
        let breadcrumbs = [];
        let currentElement = linkElement;

        while (!!currentElement) {
          let currentElementLink;
          const currentElementWrapper = currentElement.closest(
            this.options.subMenuItem,
          );

          if (currentElementWrapper) {
            currentElementLink = currentElementWrapper.querySelector(
              this.options.subMenuLink,
            );
          } else if (
            currentElement.classList.contains(
              this.options.subMenuLink.replace(".", ""),
            )
          ) {
            currentElementLink = currentElement;
          }

          if (currentElementLink) {
            breadcrumbs.unshift({
              title:
                currentElementLink.getAttribute(
                  currentElementLink.tagName === "A" ? "title" : "data-title",
                ) || currentElementLink.textContent.trim(),
              href: currentElementLink.getAttribute(
                currentElementLink.tagName === "A" ? "href" : "data-href",
              ),
            });
          }

          currentElement = currentElementWrapper?.closest(".sub-menu");
        }

        return breadcrumbs;
      }

      renderBreadcrumbs(breadcrumbs, showLastItemDivider = false) {
        if (!breadcrumbs.length) return;

        this.removeCollectionsItems();

        breadcrumbs.forEach((breadcrumbItem, index) => {
          const li = document.createElement("li");
          li.classList.add("inline-flex", "items-center");

          if (index < breadcrumbs.length - (showLastItemDivider ? 0 : 1)) {
            li.classList.add("has-divider");
            li.appendChild(this.breadcrumbLinkElement(breadcrumbItem));
          } else {
            li.appendChild(this.breadcrumbSpanElement(breadcrumbItem));
          }

          this.breadcrumbsContainer.insertAdjacentElement("beforeend", li);
        });
      }

      breadcrumbLinkElement(breadcrumbItem) {
        if (!breadcrumbItem.href || breadcrumbItem.href === "#") {
          return this.breadcrumbSpanElement(breadcrumbItem);
        }

        const breadcrumbLink = document.createElement("a");
        breadcrumbLink.href = breadcrumbItem.href;
        breadcrumbLink.innerText = breadcrumbItem.title;
        breadcrumbLink.classList.add("hover-underline");
        breadcrumbLink.setAttribute("title", breadcrumbItem.title);

        return breadcrumbLink;
      }

      breadcrumbSpanElement(breadcrumbItem) {
        const span = document.createElement("span");
        span.innerText = breadcrumbItem.title;

        return span;
      }

      removeCollectionsItems() {
        this.breadcrumbsCollectionsItems.forEach((item) => {
          item.remove();
        });
      }

      updateLocalStorageCollection() {
        if (
          !!document
            .querySelector("body")
            .classList.contains(this.options.pageProductClass)
        ) {
          this.localStorageCollectionPage =
            localStorage.getItem("collectionPage");
          localStorage.removeItem("collectionPage");

          return;
        }

        const pageTitle = document
          .querySelector("title")
          .innerText.split("–")[0]
          .trim();
        const pageLink = document.querySelector('link[rel="canonical"]').href;
        const currentPage = {
          title: pageTitle,
          href: pageLink,
        };

        localStorage.setItem("collectionPage", JSON.stringify(currentPage));
      }
    },
  );
}
