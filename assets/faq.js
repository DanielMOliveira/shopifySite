class FaqPage {
  constructor() {
    this.options = {
      header: ".header",
      faqWrapper: ".faq-section-inner",
      faqSidebarItem: "[data-target-section]",
      faqBlockWrapper: ".faq-block-wrapper",
      faqInput: "#faq-search-input",
      faqItem: ".faq-item",
      faqQuestion: ".faq-question",
      faqAnswer: ".faq-answer",
      displayBlock: "block",
      displayNone: "hidden",
      navigationItemActiveClass: "active",
      mobileBreakpoint: "(max-width: 767px)",
      noSearchResults: ".search-result-empty",
      visibleFaqSections: ".faq-block-wrapper:not(.hidden) .faq-item",
      allFaqSections: ".faq-block-wrapper .faq-item",
      faqHash: "#faq_",
      footerLinks: `.footer .footer-menu__content a[href*="#faq_"]`,
    };

    this.media = window.matchMedia("(max-width: 767px)");
    this.header = document.querySelector(this.options.header);
    this.sidebarNavigationItems = document.querySelectorAll(
      this.options.faqSidebarItem,
    );
    this.faqItems = document.querySelectorAll(this.options.faqQuestion);
    this.faqSearchInput = document.querySelector(this.options.faqInput);
    this.faqSectionsVisible = document.querySelectorAll(
      `${this.options.faqBlockWrapper}:not(${this.options.displayNone})`,
    );
    this.noSearchResults = document.querySelector(this.options.noSearchResults);
    this.synonymsData = this.faqSearchInput.dataset;

    this.parseSynonymsFromText();
    this.registerEvents();
    this.footerNavigation();
  }

  registerEvents() {
    this.faqItems.forEach((item) => {
      item.addEventListener("click", () => this.toggleFaqItem(item));
    });

    this.sidebarNavigationItems.forEach((navigationItem) => {
      navigationItem.addEventListener("click", () =>
        this.onClickSidebarItem(navigationItem),
      );
    });

    this.faqSearchInput.addEventListener("keyup", () => this.searchFaqItems());
  }

  toggleFaqItem(item) {
    const answer = item
      .closest(this.options.faqItem)
      .querySelector(this.options.faqAnswer);

    this[
      answer.classList.contains(this.options.displayNone)
        ? "showItem"
        : "hideItem"
    ](answer);
  }

  onClickSidebarItem(navigationItem) {
    const targetDataAttribute = navigationItem.dataset.targetSection,
      faqItems = document.querySelectorAll("[data-section]");

    this.sidebarNavigationItems.forEach((item) => {
      item.classList.remove(this.options.navigationItemActiveClass);
    });

    this.noSearchResults.classList.add(this.options.displayNone);
    navigationItem.classList.add(this.options.navigationItemActiveClass);

    faqItems.forEach((item) => {
      const faqSectionParent = this.getParents(item).find((node) =>
        node.classList.contains("faq-content"),
      );

      if (targetDataAttribute == "all") {
        this.showItem(item);
        this.searchFaqItems();

        return;
      }

      if (item.dataset.section == targetDataAttribute) {
        this.showParent(faqSectionParent);
        this.showItem(item);
      } else {
        this.hideParent(faqSectionParent);
        this.hideItem(item);
      }

      this.searchFaqItems();
    });

    this.scrollToElement(this.options.faqInput);
  }

  searchFaqItems() {
    const searchedValue = this.faqSearchInput.value.toLowerCase().trim(),
      queryWords = searchedValue.split(" ");

    let expandedQuery = [],
      activeSections = document
        .querySelector('[data-target-section="all"]')
        .classList.contains(this.options.navigationItemActiveClass)
        ? document.querySelectorAll(this.options.allFaqSections)
        : document.querySelectorAll(this.options.visibleFaqSections);

    queryWords.forEach((word) => {
      expandedQuery = expandedQuery.concat(this.getSynonyms(word));
    });

    expandedQuery = Array.from(new Set(expandedQuery));

    if (activeSections.length == 0) {
      const activeNavigationItem = document.querySelector(
          `${this.options.faqSidebarItem}.${this.options.navigationItemActiveClass}`,
        ),
        activeSection = document.querySelector(
          `[data-section="${activeNavigationItem.dataset.targetSection}"]`,
        );

      if (!!activeSection) {
        activeSection.classList.remove(this.options.displayNone);
        activeSections = activeSection.querySelectorAll(this.options.faqItem);
      } else {
        activeSections = document.querySelectorAll(
          this.options.visibleFaqSections,
        );
      }
    }

    if (activeSections.length == 0) return;

    activeSections.forEach((item) => {
      const faqSectionParent = this.getParents(item).find((node) =>
          node.classList.contains("faq-content"),
        ),
        question = item
          .querySelector(this.options.faqQuestion)
          .textContent.toLowerCase()
          .trim(),
        answer = item
          .querySelector(this.options.faqAnswer)
          .textContent.toLowerCase()
          .trim();

      let isWordFound = false;

      expandedQuery.forEach((expandedWord) => {
        if (question.includes(expandedWord) || answer.includes(expandedWord)) {
          isWordFound = true;
        }
      });

      if (isWordFound) {
        this.showParent(faqSectionParent);
        item.classList.remove(this.options.displayNone);
      } else {
        this.hideParent(faqSectionParent);
        item.classList.add(this.options.displayNone);
      }

      // item.classList[isWordFound ? 'remove' : 'add'](this.options.displayNone);
    });

    this.showSearchedItems();
    this.showSearchedSection();
  }

  showSearchedItems() {
    const faqSectionsVisible = document.querySelectorAll(
      `${this.options.faqBlockWrapper}:not(.${this.options.displayNone})`,
    );

    faqSectionsVisible.forEach((section) => {
      const faqSectionParent = this.getParents(section).find((node) =>
          node.classList.contains("faq-content"),
        ),
        faqItems = section.querySelectorAll(this.options.faqItem),
        hiddenItems = section.querySelectorAll(
          `${this.options.faqItem}.${this.options.displayNone}`,
        );

      if (faqItems.length == hiddenItems.length) {
        this.hideParent(faqSectionParent);
        section.classList.add(this.options.displayNone);
      } else {
        this.showParent(faqSectionParent);
        section.classList.remove(this.options.displayNone);
      }
    });

    const hiddenSections = document.querySelectorAll(
      `${this.options.faqBlockWrapper}.${this.options.displayNone}`,
    );

    this.faqSectionsVisible.length == hiddenSections.length
      ? this.noSearchResults.classList.remove(this.options.displayNone)
      : this.noSearchResults.classList.add(this.options.displayNone);
  }

  showSearchedSection() {
    if (
      !document
        .querySelector('[data-target-section="all"]')
        .classList.contains(this.options.navigationItemActiveClass)
    )
      return;

    let faqWrappers = document.querySelectorAll(this.options.faqBlockWrapper);

    faqWrappers.forEach((wrapper) => {
      if (
        wrapper.querySelectorAll(
          `${this.options.faqItem}:not(.${this.options.displayNone})`,
        ).length > 0
      ) {
        this.showItem(wrapper);
        this.noSearchResults.classList.add(this.options.displayNone);
        return;
      }
    });
  }

  showParent(parent) {
    parent.classList.remove(this.options.displayNone);
  }

  hideParent(parent) {
    parent.classList.add(this.options.displayNone);
  }

  showItem(item) {
    item.classList.add(this.options.displayBlock);
    item.classList.remove(this.options.displayNone);
  }

  hideItem(item) {
    item.classList.add(this.options.displayNone);
    item.classList.remove(this.options.displayBlock);
  }

  scrollToElement(selector) {
    const targetElement = document.querySelector(selector),
      elementOffset = this.getTopPosition(targetElement);

    window.scrollTo({
      top: elementOffset - 30,
      behavior: "smooth",
    });
  }

  getTopPosition(element) {
    const searchBarHeight = this.media.matches
      ? this.header.querySelector(".search-modal").offsetHeight
      : 0;
    const rect = element.getBoundingClientRect();
    const elementScrollOffset =
      rect.top + window.scrollY - this.header.offsetHeight - searchBarHeight;

    return elementScrollOffset;
  }

  parseSynonymsFromText() {
    this.synonyms = this.synonymsData.synonyms
      ? this.synonymsData.synonyms.split(";").map((synonymsGroup) =>
          synonymsGroup
            .trim()
            .split(",")
            .map((word) => word.trim()),
        )
      : [];
  }

  getSynonyms(inputText) {
    let synonymsList = [inputText];

    if (this.synonymsData.fullWordSearch === "true") {
      this.synonyms.forEach((synonymsGroup) => {
        if (synonymsGroup.includes(inputText)) {
          synonymsList = synonymsList.concat(synonymsGroup);
        }
      });
    } else {
      this.synonyms.forEach((synonymsGroup) => {
        synonymsGroup.forEach((word) => {
          if (word.includes(inputText)) {
            synonymsList = synonymsList.concat(synonymsGroup);
          }
        });
      });
    }

    return Array.from(new Set(synonymsList));
  }

  getParents(el) {
    let parents = [];

    for (parents = []; el; el = el.parentNode) {
      parents.push(el);
    }

    return parents;
  }

  footerNavigation() {
    const footerLinks = document.querySelectorAll(this.options.footerLinks);

    if (!footerLinks.length) return;

    const currentUrl = new URL(window.location);

    if (currentUrl.hash.startsWith(this.options.faqHash)) {
      this.navigateToSection(currentUrl.hash);
    }

    footerLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();

        if (!link.href.includes(this.options.faqHash)) return;

        this.navigateToSection(link.hash);
      });
    });
  }

  navigateToSection(hash) {
    const targetSection = hash.split(this.options.faqHash)[1];
    const targetItem = [...this.sidebarNavigationItems].find(
      (item) => item.getAttribute("data-target-section") === targetSection,
    );

    if (targetItem) {
      targetItem.click();
      history.replaceState(null, null, " ");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new FaqPage());
