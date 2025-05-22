"use strict";

class ProductsDataLayer {
  constructor() {
    this.dataLayer = window.dataLayer || [];
    this.selectors = {
      productGtm: ".card-product_gtm",
      productWrapper: ".card-wrapper",
      productsGrid: "#product-grid",
      cartRecommendedProducts: "[data-cart-recommended-products]",
      recommendedProducts: "product-recommendations",
    };
    this.cartItems = null;

    this.init();
  }

  init() {
    this.bind();
    this.getProductsLists();
    this.getSingleProduct();
    this.getCartViewItems();
  }

  bind() {
    document.addEventListener("datalayer-pagination-products", (e) => {
      this.paginationDynamicProducts(e.detail);
    });

    document.addEventListener("related-products-loaded", () => {
      this.getDynamicProducts(this.selectors.cartRecommendedProducts);
    });

    document.addEventListener("recommended-products-loaded", () => {
      this.getDynamicProducts(this.selectors.recommendedProducts);
    });

    // Added products from page
    document.addEventListener("cart-product-added", (e) => {
      this.setProductGtmData(
        ".card-wrapper",
        e.detail.element,
        e.detail.response,
        "add_to_cart",
      );
    });

    document.addEventListener("single-product-add-to-cart", (e) => {
      const form = e.detail.element;
      const response = e.detail.response;
      const formParent = form.closest(".combine-content")
        ? ".combine-content"
        : ".buy-buttons .product-form";

      this.setProductGtmData(formParent, form, response, "add_to_cart");
    });

    // Updated products from minicart
    document.addEventListener("cart-updated", (e) => {
      this.updateCartProducts(e.detail.element, e.detail.response);
    });

    // Updated products from minicart
    document.addEventListener("initial-cart-updated", async (e) => {
      if (e.detail?.element?.tagName !== "CART-REMOVE-BUTTON") return;

      await fetch(window.Shopify.routes.root + "cart.js")
        .then((response) => response.json())
        .then((data) => {
          this.cartItems = data?.items;
        });
    });
  }

  resetEcommerce() {
    this.dataLayer.push({ ecommerce: null });
  }

  getProductsLists() {
    const productLists = [
      "#product-grid",
      ".featured-products",
      ".related-products",
      ".cross-selling-products",
      ".gift-products-grid",
    ];

    productLists.forEach((selector) => {
      const productElements = document.querySelectorAll(selector);
      this.processProductElements(productElements);
    });
  }

  paginationDynamicProducts(loadedItems) {
    const loadedProductElements = loadedItems.filter((product) =>
      product.querySelector(this.selectors.productGtm),
    );
    this.processProductElements(loadedProductElements);
  }

  getDynamicProducts(selector) {
    const productElements = document.querySelectorAll(selector);
    this.processProductElements(productElements);
  }

  processProductElements(productElements) {
    let allItems = [];

    productElements.forEach((productList) => {
      const items = Array.from(
        productList.querySelectorAll(this.selectors.productGtm),
      )
        .map((product) => this.parseGtmData(product.getAttribute("data-gtm")))
        .filter((data) => data);

      if (items.length === 0) return;

      allItems.push(...items);
      this.attachClickEvent(productList);
    });

    if (allItems.length > 0) {
      this.addDataLayerForItemList(allItems);
    }
  }

  attachClickEvent(productList) {
    productList
      .querySelectorAll(this.selectors.productWrapper)
      .forEach((product) => {
        product.addEventListener("click", () => {
          const gtmData = this.getGtmData(product);
          if (gtmData) this.updateDataLayerForItemSelect(gtmData);
        });
      });
  }

  getGtmData(product) {
    const gtmDataAttribute = product
      ?.querySelector(this.selectors.productGtm)
      ?.getAttribute("data-gtm");
    return this.parseGtmData(gtmDataAttribute);
  }

  parseGtmData(gtmData) {
    try {
      return gtmData ? JSON.parse(gtmData) : null;
    } catch (error) {
      console.error("Error parsing GTM data:", error);
      return null;
    }
  }

  addDataLayerForItemList(items) {
    this.resetEcommerce();
    this.dataLayer.push({
      event: "view_item_list",
      ecommerce: {
        item_list_id: items[0].item_list_id,
        item_list_name: items[0].item_list_name,
        items: items,
      },
    });
  }

  updateDataLayerForItemSelect(gtmData) {
    this.resetEcommerce();
    this.dataLayer.push({
      event: "select_item",
      ecommerce: {
        item_list_id: gtmData.item_list_id,
        item_list_name: gtmData.item_list_name,
        items: gtmData,
      },
    });
  }

  getSingleProduct() {
    const product = document.querySelector(".buy-buttons .product-form");
    const gtmData = this.getGtmData(product);

    if (gtmData) {
      this.resetEcommerce();
      this.dataLayer.push({
        event: "view_item",
        ecommerce: {
          currency: gtmData.currency,
          value: gtmData.price,
          items: gtmData,
        },
      });
    }
  }

  formatPrice(price) {
    return +(price / 100).toFixed(2);
  }

  getProductDiscount(response) {
    let discountInfo = {};

    if (response.line_level_discount_allocations?.length) {
      response.line_level_discount_allocations.filter((discounts) => {
        let discount = discounts.discount_application;
        let discountType = discount.value_type;
        let discountRate = discount.value;
        let discounted = "";

        if (discountType === "percentage") {
          let discountDecimal = discountRate / 100;
          discounted =
            this.formatPrice(response.final_price) * (1 - discountDecimal);
        }

        if (discountType === "fixed_amount") {
          discounted = this.formatPrice(response.final_price) - discountRate;
        }

        discountInfo = {
          discount: discounted ? discounted.toFixed(2) : "",
          coupon: discount.title,
        };
      });
    }

    return discountInfo;
  }

  setProductGtmData(parentSelector, item, response, event) {
    if (item) {
      const responseData = response || {};
      const product = item.closest(parentSelector);
      const gtmData = this.getGtmData(product) || {};
      const variant = responseData.options_with_values[0];
      const totalPrice = this.formatPrice(responseData.final_line_price);
      const discounts = this.getProductDiscount(responseData);

      let data = {
        event: event,
        ecommerce: {
          currency: gtmData.currency,
          value: totalPrice,
          items: {
            ...gtmData,
            ...discounts,
            quantity: response.quantity,
            item_variant: `${variant.name}: ${variant.value}`,
          },
        },
      };

      this.cartItems = null;
      this.resetEcommerce();
      this.dataLayer.push(data);
    }
  }

  updateCartProducts(element, response) {
    if (!response || !element) return;

    let item = response.items_added?.[0] ?? response.items_removed?.[0];

    if (!item) return;

    const updatedItemId = item.variant_id;
    const updatedProduct =
      response.items.find((item) => item.variant_id === updatedItemId) ??
      this.cartItems.find((item) => item.variant_id === updatedItemId);

    if (!updatedProduct) return;

    if (updatedProduct && response.items_added.length) {
      this.setProductGtmData(
        ".cart-item",
        element,
        updatedProduct,
        "add_to_cart",
      );
    } else if (response.items_removed.length) {
      this.setProductGtmData(
        ".cart-item",
        element,
        updatedProduct,
        "remove_from_cart",
      );
    }
  }

  getCartViewItems() {
    const cartPage = document.querySelector("#main-cart-items");

    if (!cartPage) return;

    let cartData = JSON.parse(
      document.querySelector("script#datalayer-cart-items").innerText,
    );

    if (!cartData.length) return;

    cartData = cartData[0];

    cartData.items.map((item) => {
      item.price = this.formatPrice(item.price);

      if (item.line_level_discount_allocations?.length) {
        item.line_level_discount_allocations =
          item.line_level_discount_allocations.map((discount) => {
            return {
              discount_application: {
                value_type: discount.value_type,
                value: discount.value,
                title: discount.title,
              },
            };
          });
      }

      item.discount = this.getProductDiscount(item)?.discount;
      item.coupon = this.getProductDiscount(item)?.coupon;

      delete item.line_level_discount_allocations;
      delete item.final_price;
    });

    cartData.value = this.formatPrice(cartData.value);

    this.resetEcommerce();
    this.dataLayer.push({
      event: "view_cart",
      ecommerce: cartData,
    });
  }
}

document.addEventListener("DOMContentLoaded", () => new ProductsDataLayer());
