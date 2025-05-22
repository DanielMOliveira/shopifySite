class NotificationBar {
  constructor() {
    this.options = {
      hidden: "is-hidden",
      localStorageName: "notificationShown",
      notificationEl: ".top-notification",
      closeNotificationEl: ".notification-close",
    };

    this.notification = document.querySelector(this.options.notificationEl);
    this.closeNotificationEl = document.querySelector(
      this.options.closeNotificationEl,
    );

    if (localStorage.getItem(this.options.localStorageName))
      this.notification.classList.add(this.options.hidden);

    this.registerEvents();
  }

  registerEvents() {
    this.closeNotificationEl.addEventListener(
      "click",
      this._closeNotification.bind(this),
    );
  }

  _closeNotification() {
    localStorage.setItem(this.options.localStorageName, "true");

    this.notification.classList.add(this.options.hidden);
  }
}

new NotificationBar();
