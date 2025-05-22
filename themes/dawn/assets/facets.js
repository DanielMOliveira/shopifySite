class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.sortBy = "";
    this.location = window.location.href;
    this.dataLayer = window.dataLayer || [];
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      if (event.target.getAttribute("name") === "sort_by") {
        this.onSubmitHandler(event);
      }
      if (FacetFiltersForm.isMobileDevice) {
        this.onSubmitHandler(event);
      }
    }, 200);

    const facetForm = this.querySelector("form");

    facetForm.addEventListener("input", (event) => {
      if (!!event.target.classList.contains("facets-search-input")) return;

      this.debouncedOnSubmit(event);
    });

    const facetWrapper = this.querySelector("#FacetsWrapperDesktop");
    if (facetWrapper) facetWrapper.addEventListener("keyup", onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state
        ? event.state.searchParams
        : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll(".js-facet-remove").forEach((element) => {
      element.classList.toggle("disabled", disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById("ProductCount");
    const countContainerDesktop = document.getElementById(
      "ProductCountDesktop",
    );
    const loadingSpinners = document.querySelectorAll(
      ".facets-container .loading__spinner, facet-filters-form .loading__spinner",
    );
    loadingSpinners.forEach((spinner) => spinner.classList.remove("hidden"));
    document
      .getElementById("ProductGridContainer")
      .querySelector(".collection")
      .classList.add("loading");
    if (countContainer) {
      countContainer.classList.add("loading");
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add("loading");
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [
          ...FacetFiltersForm.filterData,
          { html, url },
        ];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === "function")
          initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === "function")
      initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    document.getElementById("ProductGridContainer").innerHTML = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductGridContainer").innerHTML;

    document.dispatchEvent(new CustomEvent("product-grid-updated"));
  }

  static renderProductCount(html) {
    const count = new DOMParser()
      .parseFromString(html, "text/html")
      .getElementById("ProductCount").innerHTML;
    const container = document.getElementById("ProductCount");
    const containerDesktop = document.getElementById("ProductCountDesktop");
    container.innerHTML = count;
    container.classList.remove("loading");
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove("loading");
    }
    const loadingSpinners = document.querySelectorAll(
      ".facets-container .loading__spinner, facet-filters-form .loading__spinner",
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add("hidden"));
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, "text/html");
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      "#FacetFiltersForm .js-filter",
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      "#FacetFiltersForm .js-filter",
    );

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (
        !Array.from(facetDetailsElementsFromFetch).some(
          ({ id }) => currentElement.id === id,
        )
      ) {
        currentElement.remove();
      }
    });

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter(
      (facet) => !facet.id.includes("price"),
    );

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML =
          elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } =
            facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document
            .querySelector(`#${elementToRender.parentElement.id} .js-filter`)
            .before(elementToRender);
        }
      }
    });

    Array.from(facetDetailsElementsFromFetch).forEach((facet) => {
      if (facet.id.includes("price")) {
        if (
          ![...facet.querySelectorAll("input")].some((input) => input.value)
        ) {
          document
            .querySelectorAll(".price-facet-input")
            .forEach((el) => (el.value = ""));
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);
    FacetFiltersForm.renderActiveFiltersValue(parsedHTML);
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = [
      ".active-facets-mobile",
      ".active-facets-desktop",
    ];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML =
        activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const showResultsButton = document.querySelector("[data-show-results]");
    const showResultsWrapper = showResultsButton.parentElement;
    const updatedShowResultsButton = html.querySelector("[data-show-results]");

    showResultsButton.remove();

    showResultsWrapper.appendChild(updatedShowResultsButton);
  }

  static renderActiveFiltersValue(html) {
    const targetElement = document.querySelector(
        ".listing-mob-actions .active-facets-mobile",
      ),
      updatedActiveFiltersValue = html.querySelector(".active-facets-mobile");

    targetElement.replaceWith(updatedActiveFiltersValue);
  }

  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`,
    );
  }

  static getSections() {
    return [
      {
        section: document.getElementById("product-grid").dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  createSearchParamsSingleList(event, form) {
    const formData = new FormData(),
      searchParamsInitial = window.location.search.slice(1),
      urlParams = new URLSearchParams(searchParamsInitial),
      currentListButton = event.target,
      currentList = currentListButton
        .closest("details")
        .querySelector(".facets-wrap"),
      inputs = currentList.querySelectorAll("input");

    for (const [key, value] of urlParams.entries()) {
      formData.append(key, value);
    }

    inputs.forEach((input) => {
      if (formData.has(input.name)) {
        formData.delete(input.name);
      }
    });

    inputs.forEach((input) => {
      if (input.checked) {
        formData.append(input.name, input.value);
      }
      if (input.classList.contains("price-field-input")) {
        if (
          input.getAttribute("name") == "filter.v.price.gte" &&
          input.value > 0
        ) {
          formData.append(input.name, input.value);
        }
        if (
          input.getAttribute("name") == "filter.v.price.lte" &&
          input.value != parseFloat(input.dataset.max)
        ) {
          formData.append(input.name, input.value);
        }
      }
    });

    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll(
      "facet-filters-form form",
    );
    if (event.srcElement.className == "mobile-facets__checkbox") {
      const searchParams = FacetFiltersForm.isMobileDevice
        ? this.createSearchParams(event.target.closest("form"))
        : this.createSearchParamsSingleList(event);
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile =
        event.target.closest("form").id === "FacetFiltersFormMobile";

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (
            form.id === "FacetSortForm" ||
            form.id === "FacetFiltersForm" ||
            form.id === "FacetSortDrawerForm"
          ) {
            forms.push(
              FacetFiltersForm.isMobileDevice
                ? this.createSearchParams(form)
                : this.createSearchParamsSingleList(event),
            );
          }
        } else if (form.id === "FacetFiltersFormMobile") {
          forms.push(
            FacetFiltersForm.isMobileDevice
              ? this.createSearchParams(form)
              : this.createSearchParamsSingleList(event),
          );
        }
      });
      this.location = window.location.href;
      this.onSubmitForm(forms.join("&"), event);

      const searchParams = new URLSearchParams(window.location.search);
      this.filterAndSortDataLayer(searchParams, sortFilterForms);
    }
  }

  filterAndSortDataLayer(searchParams, sortFilterForms) {
    const sortBy = searchParams.get("sort_by");

    if (sortBy && this.sortBy !== sortBy) {
      this.sortBy = sortBy;
      this.dataLayer.push({
        event: "sort_use",
        sort_option: sortBy,
      });

      return;
    }

    const formArray = Array.from(sortFilterForms);
    const inputsArray = formArray.flatMap((form) =>
      Array.from(form.querySelectorAll("input")),
    );

    for (const [key, value] of searchParams) {
      if (!key.startsWith("filter.") || key.startsWith("sort_by")) continue;

      const decodedValue = decodeURIComponent(value);
      const isPriceFilter = key.includes("price");

      const selectedInput = inputsArray.find(
        (input) => input.value === decodedValue,
      );

      if (selectedInput) {
        let detailsElement = selectedInput.closest("details");
        if (detailsElement) {
          let filterOption = isPriceFilter
            ? selectedInput.value
            : selectedInput.parentElement.textContent.trim();
          let filterGroup = detailsElement
            .querySelector("legend")
            .textContent.trim();

          this.dataLayer.push({
            event: "filter_use",
            filter_group: filterGroup,
            filter_option: filterOption,
          });
        }
      }
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf("?") == -1
        ? ""
        : event.currentTarget.href.slice(
            event.currentTarget.href.indexOf("?") + 1,
          );
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.isMobileDeviceMatchMedia =
  window.matchMedia("(max-width: 767px)");
FacetFiltersForm.isMobileDevice =
  FacetFiltersForm.isMobileDeviceMatchMedia.matches;

FacetFiltersForm.isMobileDeviceMatchMedia.addEventListener("change", () => {
  FacetFiltersForm.isMobileDevice =
    FacetFiltersForm.isMobileDeviceMatchMedia.matches;
});

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define("facet-filters-form", FacetFiltersForm);
FacetFiltersForm.setListeners();

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector("a");
    if (!facetLink) {
      let facetPriceLink = this.querySelector(".facets__reset-price");

      if (!!facetPriceLink) this.resetPriceFilter(facetPriceLink);

      return;
    }

    facetLink.setAttribute("role", "button");
    facetLink.addEventListener("click", this.closeFilter.bind(this));
    facetLink.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === "SPACE") this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form =
      this.closest("facet-filters-form") ||
      document.querySelector("facet-filters-form");
    form.onActiveFilterClick(event);
  }

  resetPriceFilter(facetPriceLink) {
    facetPriceLink.addEventListener("click", this.resetPrice.bind(this));
  }

  resetPrice() {
    const priceRangeFilterWrapper = this.closest(".facets__display"),
      inputMin = priceRangeFilterWrapper.querySelector(
        `.price-field-input[name='filter.v.price.gte']`,
      ),
      inputMax = priceRangeFilterWrapper.querySelector(
        `.price-field-input[name='filter.v.price.lte']`,
      );

    const facetSave = priceRangeFilterWrapper.querySelector("facet-save a");

    if (
      Math.ceil(parseFloat(inputMin.value)) !=
      Math.ceil(parseFloat(inputMin.dataset.min))
    ) {
      inputMin.value = inputMin.dataset.min;

      document.dispatchEvent(new CustomEvent("price-range-input-updated"));
    }

    if (
      Math.ceil(parseFloat(inputMax.value)) !=
      Math.ceil(parseFloat(inputMin.dataset.max))
    ) {
      inputMax.value = inputMin.dataset.max;

      document.dispatchEvent(new CustomEvent("price-range-input-updated"));
    }

    facetSave.click();
  }
}

customElements.define("facet-remove", FacetRemove);

class FacetSave extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector("a");

    facetLink.setAttribute("role", "button");
    facetLink.addEventListener("click", this.applyFilter.bind(this));
    facetLink.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === "SPACE") this.applyFilter(event);
    });
  }

  applyFilter(event) {
    event.preventDefault();

    const form =
      this.closest("facet-filters-form") ||
      document.querySelector("facet-filters-form");

    form.onSubmitHandler(event);
  }
}

customElements.define("facet-save", FacetSave);
