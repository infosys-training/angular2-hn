import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Welcome to angular-hnpwa!');
  });

  describe('Favorites feature', () => {
    beforeEach(() => {
      browser.executeScript('localStorage.clear();');
      page.navigateTo();
    });

    it('should have favorites link in header', () => {
      expect(page.navigateToFavorites()).toBeTruthy();
    });

    it('should navigate to favorites page', async () => {
      await page.navigateToFavorites();
      const url = await page.getCurrentUrl();
      expect(url).toContain('/favorites/1');
    });

    it('should toggle favorite on story item', async () => {
      page.navigateTo();
      const toggle = page.getFavoriteToggle(0);
      const initialText = await toggle.getText();

      await page.clickFavoriteToggle(0);
      const newText = await toggle.getText();

      expect(initialText).toBe('☆');
      expect(newText).toBe('★');
    });

    it('should persist favorites across page reload', async () => {
      page.navigateTo();
      await page.clickFavoriteToggle(0);

      await browser.refresh();

      const toggle = page.getFavoriteToggle(0);
      const text = await toggle.getText();
      expect(text).toBe('★');
    });

    it('should show favorited items on favorites page', async () => {
      page.navigateTo();
      await page.clickFavoriteToggle(0);

      await page.navigateToFavorites();

      const toggle = page.getFavoriteToggle(0);
      const text = await toggle.getText();
      expect(text).toBe('★');
    });
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
