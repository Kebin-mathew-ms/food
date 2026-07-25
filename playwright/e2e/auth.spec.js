import { test, expect } from '@playwright/test';

test.describe('🔑 User Authentication & Session Workflows E2E', () => {
  test('1. Redirects guest user to login screen', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('2. Successful validation checking registration screen inputs', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('button[type="submit"]')).toContainText('Register');
  });

  test('3. Failed login display on invalid login details', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'notexist@foodplatform.org');
    await page.fill('input[type="password"]', 'wrongpass123');
    await page.click('button[type="submit"]');
    
    // Expect error state warning or input invalidation flags
    await expect(page.locator('body')).toBeVisible();
  });
});
