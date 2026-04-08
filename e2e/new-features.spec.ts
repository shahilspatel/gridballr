import { test, expect } from '@playwright/test'

test.describe('New Feature Tests', () => {
  test('my board loads builder when no auth configured', async ({ page }) => {
    // Without Supabase env vars, middleware skips auth — board loads directly
    await page.goto('/my-board')
    await expect(page.locator('text=DRAG TO REORDER')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
  })

  test('global search opens with shortcut indicator', async ({ page }) => {
    await page.goto('/')
    // Search button should be visible in navbar
    await expect(page.locator('text=SEARCH')).toBeVisible()
  })

  test('compare page has share link button', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.locator('text=COPY_SHARE_LINK')).toBeVisible()
  })

  test('compare page loads with URL params', async ({ page }) => {
    await page.goto('/compare?a=caleb-downs&b=sonny-styles')
    await expect(page.locator('text=COMPARE_ENGINE')).toBeVisible()
    await expect(page.locator('text=MEASURABLES_COMPARISON')).toBeVisible()
  })

  test('terms of service page loads', async ({ page }) => {
    await page.goto('/terms')
    await expect(page.locator('text=TERMS_OF_SERVICE')).toBeVisible()
    await expect(page.locator('text=ACCEPTANCE_OF_TERMS')).toBeVisible()
  })

  test('privacy policy page loads', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('text=PRIVACY_POLICY')).toBeVisible()
    await expect(page.locator('text=INFORMATION_WE_COLLECT')).toBeVisible()
  })

  test('draft history links to player profiles', async ({ page }) => {
    await page.goto('/draft-history/2025')
    await expect(page.locator('text=DRAFT_ARCHIVE')).toBeVisible()
    // Player names should be clickable links
    const firstPlayerLink = page.locator('a:has-text("Cam Ward")').first()
    await expect(firstPlayerLink).toBeVisible()
  })

  test('player profile has compare button', async ({ page }) => {
    await page.goto('/players/fernando-mendoza')
    await expect(page.locator('text=COMPARE_WITH...')).toBeVisible()
  })

  test('404 page renders correctly', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz')
    // Verify 404 status code
    expect(response?.status()).toBe(404)
  })

  test('footer has legal links', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
    await expect(page.locator('footer a:has-text("Terms of Service")')).toBeVisible()
    await expect(page.locator('footer a:has-text("Privacy Policy")')).toBeVisible()
    await expect(page.locator('footer a:has-text("Draft History")')).toBeVisible()
  })
})
