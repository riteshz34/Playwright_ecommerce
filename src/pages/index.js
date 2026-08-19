/**
 * Barrel export for the page-object layer.
 *
 * Lets a spec pull in several pages with one require, and gives the fixture file
 * a single import site to keep in sync.
 */

module.exports = {
  BasePage: require('./BasePage'),
  LoginPage: require('./LoginPage'),
  InventoryPage: require('./InventoryPage'),
  ProductDetailsPage: require('./ProductDetailsPage'),
  CartPage: require('./CartPage'),
  CheckoutInformationPage: require('./CheckoutInformationPage'),
  CheckoutOverviewPage: require('./CheckoutOverviewPage'),
  CheckoutCompletePage: require('./CheckoutCompletePage'),
  HeaderComponent: require('./components/HeaderComponent'),
  SideMenuComponent: require('./components/SideMenuComponent'),
};
