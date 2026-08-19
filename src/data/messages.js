/**
 * Expected application copy, centralised.
 *
 * Assertions reference these constants instead of inline strings so that a copy
 * change is a one-line fix rather than a hunt across twenty spec files.
 */

module.exports = {
  errors: {
    lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
    invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
    usernameRequired: 'Epic sadface: Username is required',
    passwordRequired: 'Epic sadface: Password is required',
  },
  titles: {
    products: 'Products',
    cart: 'Your Cart',
    checkoutStepOne: 'Checkout: Your Information',
    checkoutStepTwo: 'Checkout: Overview',
    checkoutComplete: 'Checkout: Complete!',
  },
  labels: {
    appLogo: 'Swag Labs',
    paymentInformation: 'SauceCard #31337',
    shippingInformation: 'Free Pony Express Delivery!',
  },
};
