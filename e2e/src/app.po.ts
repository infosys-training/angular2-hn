import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get(browser.baseUrl) as Promise<any>;
  }

  getTitleText() {
    return element(by.css('app-root h1')).getText() as Promise<string>;
  }

  navigateToFavorites() {
    return element(by.linkText('favorites')).click();
  }

  getFavoriteToggle(index: number = 0) {
    return element.all(by.css('.favorite-toggle')).get(index);
  }

  clickFavoriteToggle(index: number = 0) {
    return this.getFavoriteToggle(index).click();
  }

  getCurrentUrl() {
    return browser.getCurrentUrl();
  }
}
