class Dropdown extends HTMLElement {
  constructor() {
    super();

    this.options = {
      dropdownTrigger: ".dropdown-trigger",
      dropdownContent: ".dropdown-content",
    };

    this.dropdownButton = this.querySelector(this.options.dropdownTrigger);
    this.dropdownContent = this.querySelector(this.options.dropdownContent);

    this.registerEvents();
  }

  registerEvents() {
    document.addEventListener("click", () => this.toggleDropdown(event));
  }

  toggleDropdown(event) {
    const isDropdownTarget =
      event.target === this.dropdownButton ||
      this.dropdownButton.contains(event.target);

    this.dropdownContent.classList[isDropdownTarget ? "toggle" : "add"](
      "hidden",
    );
  }
}

customElements.define("dropdown-item", Dropdown);
