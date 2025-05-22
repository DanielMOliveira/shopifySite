class priceRangeSlider {
  constructor() {
    this.stepsSlider = document.getElementById("price-range-slider");
    this.priceRangeFilterWrapper = document.querySelector(
      ".price-range-filter-wrapper",
    );
    this.inputMin = this.priceRangeFilterWrapper.querySelector(
      ".price-field-input[name='filter.v.price.gte']",
    );
    this.inputMax = this.priceRangeFilterWrapper.querySelector(
      ".price-field-input[name='filter.v.price.lte']",
    );

    this.inputs = [this.inputMin, this.inputMax];
    this.priceValueTotalBadge =
      this.priceRangeFilterWrapper.querySelector(".price-value-total");
    this.resetButton = this.priceRangeFilterWrapper.querySelector(
      "facet-remove .facets__reset-price",
    );
    this.saveButton = this.priceRangeFilterWrapper.querySelector(
      "facet-save .facets__save",
    );

    this.init();
  }

  init() {
    this.create();
    this.update();
    this.endUpdate();
    this.handleInputChange();

    document.addEventListener("price-range-input-updated", () => {
      this.stepsSlider.noUiSlider.set([
        Math.ceil(parseFloat(this.inputMin.value)),
        Math.ceil(parseFloat(this.inputMax.value)),
      ]);

      this.resetButton.classList.add("is-disabled");

      this.updateValuesBadge();
    });
  }

  create() {
    noUiSlider.create(this.stepsSlider, {
      start: [
        Math.ceil(parseFloat(this.stepsSlider.dataset.minValue)),
        Math.ceil(parseFloat(this.stepsSlider.dataset.maxValue)),
      ],
      connect: true,
      range: {
        min: Math.ceil(parseFloat(this.stepsSlider.dataset.min)),
        max: Math.ceil(parseFloat(this.stepsSlider.dataset.max)),
      },
      step: 1,
    });
  }

  updateValuesBadge() {
    const stepsSliderMin = Math.ceil(parseFloat(this.stepsSlider.dataset.min)),
      stepsSliderMax = Math.ceil(parseFloat(this.stepsSlider.dataset.max)),
      inputMin = Math.ceil(parseFloat(this.inputMin.value)),
      inputMax = Math.ceil(parseFloat(this.inputMax.value));

    if (stepsSliderMin != inputMin && stepsSliderMax != inputMax) {
      this.priceValueTotalBadge.innerText = "2";
      this.saveButton.classList.remove("is-disabled");
      this.resetButton.classList.remove("is-disabled");
      this.priceValueTotalBadge.classList.remove("!hidden");
    } else if (stepsSliderMin != inputMin || stepsSliderMax > inputMax) {
      this.priceValueTotalBadge.innerText = "1";
      this.saveButton.classList.remove("is-disabled");
      this.resetButton.classList.remove("is-disabled");
      this.priceValueTotalBadge.classList.remove("!hidden");
    } else {
      this.priceValueTotalBadge.innerText = "0";
      this.saveButton.classList.add("is-disabled");
      this.resetButton.classList.add("is-disabled");
      this.priceValueTotalBadge.classList.add("!hidden");
    }
  }

  update() {
    this.stepsSlider.noUiSlider.on("update", (values, handle) => {
      this.inputs[handle].value = values[handle];
    });
  }

  endUpdate() {
    this.stepsSlider.noUiSlider.on("end", (values, handle) => {
      this.inputs[handle].closest("form").dispatchEvent(new Event("input"));
      this.inputs[handle].value = values[handle];

      this.updateValuesBadge();
    });
  }

  handleInputChange() {
    this.inputs.forEach((input, handle) => {
      input.addEventListener("change", () => {
        this.stepsSlider.noUiSlider.setHandle(handle, input.value);

        this.updateValuesBadge();
      });

      input.addEventListener("keydown", (e) => {
        var values = this.stepsSlider.noUiSlider.get();
        var value = Number(values[handle]);

        var steps = this.stepsSlider.noUiSlider.steps();
        var step = steps[handle];
        var position;

        // 13 is enter,
        // 38 is key up,
        // 40 is key down.
        switch (e.which) {
          case 13:
            this.stepsSlider.noUiSlider.setHandle(handle, input.value);
            break;

          case 38:
            // Get step to go increase slider value (up)
            position = step[1];

            // false = no step is set
            if (position === false) {
              position = 1;
            }

            // null = edge of slider
            if (position !== null) {
              this.stepsSlider.noUiSlider.setHandle(handle, value + position);
            }

            break;

          case 40:
            position = step[0];

            if (position === false) {
              position = 1;
            }

            if (position !== null) {
              this.stepsSlider.noUiSlider.setHandle(handle, value - position);
            }

            break;
        }

        this.updateValuesBadge();
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new priceRangeSlider());
