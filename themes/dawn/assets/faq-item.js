class FaqPage {
  constructor() {
    this.options = {
      faqItem: ".faq-item",
      faqQuestion: ".faq-question",
      faqAnswer: ".faq-answer",
      displayBlock: "block",
      displayNone: "hidden",
    };

    this.faqItems = document.querySelectorAll(this.options.faqQuestion);

    this.init();
  }

  init() {
    this.faqItems.forEach((item) => {
      item.addEventListener("click", () => this.toggleFaqItem(item));
    });
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

  showItem(item) {
    item.classList.add(this.options.displayBlock);
    item.classList.remove(this.options.displayNone);
  }

  hideItem(item) {
    item.classList.add(this.options.displayNone);
    item.classList.remove(this.options.displayBlock);
  }
}

document.addEventListener("DOMContentLoaded", () => new FaqPage());
