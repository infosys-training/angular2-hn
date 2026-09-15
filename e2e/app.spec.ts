import { test, expect } from '@playwright/test';

test('redirects the root path to the news feed', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/news\/1$/);
  await expect(page.locator('app-header')).toBeVisible();
});

test('renders feed items with a comment link', async ({ page }) => {
  await page.goto('/news/1');
  const firstItem = page.locator('app-item').first();
  await expect(firstItem).toBeVisible({ timeout: 30_000 });
  await expect(firstItem.getByRole('link')).not.toHaveCount(0);
});

test('opens the settings panel from the header', async ({ page }) => {
  await page.goto('/news/1');
  await page.locator('app-header img.settings').click();
  await expect(page.locator('app-settings')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Settings', level: 1 })).toBeVisible();
});
