import { test, expect } from '@playwright/test';

test.describe('angular2-hn app shell', () => {
  test('boots and renders the header, nav and footer', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('app-root')).toBeVisible();
    await expect(page.locator('app-header header')).toBeVisible();

    const nav = page.locator('.header-nav');
    await expect(nav.getByRole('link', { name: 'new' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'show' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'ask' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'jobs' })).toBeVisible();

    await expect(page.locator('app-footer')).toBeVisible();
  });

  test('routing updates the URL when navigating feeds', async ({ page }) => {
    await page.goto('/');
    await page.locator('.header-nav').getByRole('link', { name: 'show' }).click();
    await expect(page).toHaveURL(/\/show\/1$/);
  });

  test('settings panel opens via the cog and switches theme', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('app-settings')).toHaveCount(0);

    await page.locator('img.settings').click();
    const popup = page.locator('app-settings .popup');
    await expect(popup).toBeVisible();
    await expect(popup.getByRole('heading', { name: 'Settings' })).toBeVisible();

    await page.locator('app-settings input[type="radio"][value="night"]').click();
    await expect(page.locator('div.night')).toBeVisible();
  });
});
