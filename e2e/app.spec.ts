import { test, expect } from '@playwright/test';

test.describe('Euriska Cultural Web App E2E Tests', () => {
  test('Homepage loads and displays festival timeline milestones', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Euriska/i);
    
    // Check key elements on home dashboard
    await expect(page.locator('text=Ganpati Bappa Morya').first()).toBeVisible();
    await expect(page.locator('text=Ganesh Aagman & Sthapana').first()).toBeVisible();
    await expect(page.locator('text=Daily Evening Maha Aarti').first()).toBeVisible();
    await expect(page.locator('text=Maha Prasad Community Dinner').first()).toBeVisible();
    await expect(page.locator('text=Ganesh Visarjan Procession').first()).toBeVisible();
  });

  test('Cultural Calendar shows festivals and expands schedule', async ({ page }) => {
    await page.goto('/?tab=events');
    await expect(page.locator('text=Cultural & Festive')).toBeVisible();
    await expect(page.locator('text=Ganesh Chaturthi').first()).toBeVisible();

    // Check that schedule items are present
    await expect(page.locator('text=Ganesh Aagman & Sthapana Ceremony')).toBeVisible();
    await expect(page.locator('text=Kalakriti Cultural Activities (Night 1)')).toBeVisible();
  });

  test('Financial Report triggers Admin Login popup for non-admin residents', async ({ page }) => {
    await page.goto('/?tab=report');
    // Without admin login, should see Admin Login Modal heading
    await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
    await expect(page.locator('text=Admin Gateway')).toBeVisible();
  });
});
