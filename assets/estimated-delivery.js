class EstimatedDelivery {
  constructor() {
    this.options = {
      element: ".custom-estimated-delivery",
    };

    this.init();
  }

  init() {
    const elements = document.querySelectorAll(this.options.element);

    elements.forEach((element) => {
      const daysFromData = element.dataset.days
        ?.split(",")
        .map((day) => day.trim());
      const monthsFromData = element.dataset.months
        ?.split(",")
        .map((month) => month.trim());

      this.options.days = daysFromData || [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      this.options.months = monthsFromData || [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const minMaxDeliveryDays = element?.dataset?.minMax?.trim() || undefined;

      if (minMaxDeliveryDays) {
        const elementText = element.querySelector("[data-text]");
        const min = minMaxDeliveryDays?.split("-")[0];
        const max = minMaxDeliveryDays?.split("-")[1];

        if (!min || !max) return;

        const fromDate = this.getEstimatedDeliveryDate(new Date(), min);
        const toDate = this.getEstimatedDeliveryDate(new Date(), max);

        elementText.innerText = `${fromDate} - ${toDate}`;
        element.classList.remove("opacity-0");
        element.classList.remove("pointer-events-none");
      }
    });
  }

  getEstimatedDeliveryDate(startDate, days) {
    const dayOfTheWeek = startDate.getDay();
    let daysToAdd = parseInt(days, 10);

    if (dayOfTheWeek == 0) daysToAdd++;
    if (dayOfTheWeek + daysToAdd >= 6) {
      const remainingWorkDays = daysToAdd - (5 - dayOfTheWeek);

      daysToAdd += 2;

      if (remainingWorkDays > 5) {
        daysToAdd += 2 * Math.floor(remainingWorkDays / 5);

        if (remainingWorkDays % 5 == 0) {
          daysToAdd -= 2;
        }
      }
    }

    startDate.setDate(startDate.getDate() + daysToAdd);

    return `${this.options.days[startDate.getDay()]}, ${this.options.months[startDate.getMonth()]} ${startDate.getDate()}`;
  }
}

document.addEventListener("DOMContentLoaded", () => new EstimatedDelivery());
