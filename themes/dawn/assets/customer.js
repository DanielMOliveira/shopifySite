const selectors = {
  customerAddresses: "[data-customer-addresses]",
  addressCountrySelect: "[data-address-country-select]",
  addressContainer: "[data-address]",
  toggleAddressButton: "button[aria-expanded]",
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: "button[data-confirm-message]",
};

const attributes = {
  expanded: "aria-expanded",
  confirmMessage: "data-confirm-message",
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container
      ? {
          container,
          addressContainer: container.querySelector(selectors.addressContainer),
          toggleButtons: document.querySelectorAll(
            selectors.toggleAddressButton,
          ),
          cancelButtons: container.querySelectorAll(
            selectors.cancelAddressButton,
          ),
          deleteButtons: container.querySelectorAll(
            selectors.deleteAddressButton,
          ),
          countrySelects: container.querySelectorAll(
            selectors.addressCountrySelect,
          ),
        }
      : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      new Shopify.CountryProvinceSelector(
        "AddressCountryNew",
        "AddressProvinceNew",
        {
          hideElement: "AddressProvinceContainerNew",
        },
      );
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        new Shopify.CountryProvinceSelector(
          `AddressCountry_${formId}`,
          `AddressProvince_${formId}`,
          {
            hideElement: `AddressProvinceContainer_${formId}`,
          },
        );
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener("click", this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener("click", this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener("click", this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target) {
    target.setAttribute(
      attributes.expanded,
      (target.getAttribute(attributes.expanded) === "false").toString(),
    );
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    document.querySelector("body").classList.add("overflow-hidden");
    this._toggleExpanded(currentTarget);
  };

  _handleCancelButtonClick = ({ currentTarget }) => {
    document.querySelector("body").classList.remove("overflow-hidden");
    this._toggleExpanded(
      currentTarget
        .closest(selectors.addressContainer)
        .querySelector(`[${attributes.expanded}]`),
    );
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: "delete" },
      });
    }
  };
}

function formToJson(elements) {
  return [].reduce.call(
    elements,
    function (data, element) {
      data[element.name] = element.value;
      return data;
    },
    {},
  );
}

function getUrlString(data) {
  const urlParameters = Object.entries(data)
    .map(function (e) {
      return e.join("=");
    })
    .join("&");

  return urlParameters;
}

function getUrlParameter(sParam) {
  const sPageUrl = decodeURIComponent(window.location.search.substring(1)),
    sUrlVariables = sPageUrl.split("&");
  let sParameterName;

  for (let i = 0; i < sUrlVariables.length; i++) {
    sParameterName = sUrlVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
}

function ajaxFormInit(form) {
  const formTypeInput = form.querySelector("input[name='form_type']");
  const formType = formTypeInput ? formTypeInput.value : null;

  const inputs = form.querySelectorAll("[name]");
  const addressCountryInput = form.querySelector(
    "select[name='address[country]']",
  );
  const dataConsentInput = form.querySelector(
    "input[name='customer[notes][Data Consent]']",
  );
  const countryLangInput = form.querySelector("input[name='country_code']");
  const countryLang = countryLangInput ? countryLangInput.value : null;

  const submitButton = form.querySelector("button[type='submit']");
  const alert = form.querySelector('[data-alert="status"]');
  const alertMsgs = form.querySelector(".form-alerts");

  form.addEventListener("submit", function (e) {
    const dataConsentChecked = dataConsentInput
      ? dataConsentInput.checked
      : true;

    if (
      formType === "customer_address" &&
      addressCountryInput.value !== "---"
    ) {
      return;
    }
    if (formType === "customer") {
      return;
    }
    if (formType === "family") {
      submitButton.disabled = true;
      submitButton.innerHTML = submitButton.getAttribute("data-wait");

      const familyMembersCount = 10;

      for (let i = 1; i <= familyMembersCount; i++) {
        const nameInput = form.querySelector(`input[name='name_${i}']`);
        const genderInput = form.querySelector(`[name='gender_${i}']`);
        const dobInput = form.querySelector(`[name='dob_${i}']`);
        const familyMemberInput = form.querySelector(
          `input[name='family_member_${i}']`,
        );

        const name = nameInput ? nameInput.value : "";
        const gender = genderInput ? genderInput.value : "";
        const dob = dobInput ? dobInput.value : "";

        const combinedValues = `${name}, ${gender}, ${dob}`;

        if (familyMemberInput) {
          familyMemberInput.value = combinedValues;
        }
      }
    } else if (formType !== "customer_address") {
      if (formType !== "create_customer") {
        submitButton.disabled = true;
        submitButton.innerHTML = submitButton.getAttribute("data-wait");
      }
    }

    let alertMsg = {
      success: "Success message",
      error: "Error message",
    };

    if (alertMsgs) {
      try {
        alertMsg = JSON.parse(alertMsgs.innerHTML);
      } catch (error) {
        console.error("Error parsing alertMsgs:", error);
      }
    }

    if (formType === "create_customer") {
      if (dataConsentChecked) {
        return;
      } else {
        alert.className = "alert text-red-500";
        alert.innerHTML = alertMsg.error;
        //return;
      }
    }

    // Check for customer_address form type
    if (formType === "customer_address") {
      if (
        addressCountryInput.value === "---" ||
        addressCountryInput.value === ""
      ) {
        alert.className = "alert text-red-500";
        alert.innerHTML = "Please select a valid country.";
        e.preventDefault(); // Prevent the form from submitting
        return; // Exit to stop further processing
      }
      // If a valid country is selected, allow normal submission
      return; // Exit so the form submits normally
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    const action = form.getAttribute("action");

    const fetchData = {
      method: "POST",
      body: getUrlString(formToJson(inputs)),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        Accept: "text/html, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
      },
    };

    fetch(action, fetchData)
      .then(function (response) {
        const checkoutUrl = getUrlParameter("checkout_url");

        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.getAttribute("data-update");

        if (alert && formType !== "create_customer") {
          alert.className = "alert alert-success";
          alert.innerHTML = alertMsg.success;
        }

        if (checkoutUrl) {
          window.location = checkoutUrl;
        } else if (
          formType === "customer_address" ||
          formType === "unsubscribe"
        ) {
          window.location.reload();
        }
      })
      .catch(function (err) {
        console.error(err);
        if (alert) {
          alert.className = "alert alert-error";
          alert.innerHTML = alertMsg.error;
        }
      });
  });
}

window.onload = function () {
  const loadingElement = document.getElementById("loading");

  if (loadingElement) {
    loadingElement.classList.add("loaded");

    if (localStorage.getItem("customer-register")) {
      localStorage.removeItem("customer-register");

      loadingElement.classList.remove("loaded");
      loadingElement.classList.remove("text-white");

      setTimeout(() => {
        window.location = window.location + "#main";
        window.location.reload();
      }, 2000);
    }
  }
};

const smsCheckbox = document.getElementById("subscribe_sms_checkbox");
const smsHiddenInput = document.getElementById("sms_consent_hidden");

if (smsCheckbox && smsHiddenInput) {
  smsCheckbox.addEventListener("change", function () {
    smsHiddenInput.value = smsCheckbox.checked ? "yes" : "";
  });
}

const emailCheckbox = document.getElementById("subscribe_email_checkbox");
const emailHiddenInput = document.getElementById("email_consent_hidden");

if (emailCheckbox && emailHiddenInput) {
  emailCheckbox.addEventListener("change", function () {
    emailHiddenInput.value = emailCheckbox.checked ? "yes" : "";
  });
}

document
  .querySelectorAll("input[name='form_type']:not([value='localization'])")
  .forEach(function (el) {
    ajaxFormInit(el.closest("form"));
  });
