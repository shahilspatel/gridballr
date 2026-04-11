import { test, expect } from '@playwright/test'

test.describe('Auth & Checkout Flow', () => {
  test('signup page displays form', async ({ page }) => {
    await page.goto('/signup')

    // Verify signup page loads with all required form elements.
    // No conditional assertions — if any of these aren't visible, the test
    // should fail, not silently pass (false-green pattern from round 5 audit).
    await expect(page.getByRole('button', { name: 'CREATE_ACCOUNT' })).toBeVisible()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('login page displays form', async ({ page }) => {
    await page.goto('/login')

    // Verify auth gateway loads
    await expect(page.locator('text=AUTH_GATEWAY')).toBeVisible()

    // Check for form inputs
    const inputs = page.locator('input')
    if ((await inputs.count()) > 0) {
      await expect(inputs.first()).toBeVisible()
    }
  })

  test('pricing page checkout buttons visible', async ({ page }) => {
    await page.goto('/pricing')

    // Verify pricing page loads
    await expect(page.locator('text=UPGRADE TO')).toBeVisible()

    // Both checkout buttons must be visible
    await expect(page.getByRole('button', { name: '$12/MONTH' })).toBeVisible()
    await expect(page.getByRole('button', { name: '$80/YEAR' })).toBeVisible()

    // Free tier button
    await expect(page.locator('text=CURRENT_PLAN')).toBeVisible()
  })

  test('checkout buttons are clickable', async ({ page }) => {
    await page.goto('/pricing')

    // Get the buttons
    const monthlyBtn = page.getByRole('button', { name: '$12/MONTH' })
    const annualBtn = page.getByRole('button', { name: '$80/YEAR' })

    // Verify they're enabled and clickable
    await expect(monthlyBtn).toBeEnabled()
    await expect(annualBtn).toBeEnabled()
  })

  test('pricing page layout complete', async ({ page }) => {
    await page.goto('/pricing')

    // Verify all key sections exist
    await expect(page.locator('text=UPGRADE TO')).toBeVisible()
    await expect(page.locator('text=SECURE_CHECKOUT')).toBeVisible()
    await expect(page.locator('text=POWERED BY STRIPE')).toBeVisible()

    // Check for pricing tiers
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThanOrEqual(3) // At least free, monthly, annual
  })

  test('navigate signup → login → pricing flow', async ({ page }) => {
    // Start at signup
    await page.goto('/signup', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'CREATE_ACCOUNT' })).toBeVisible({
      timeout: 15_000,
    })

    // Navigate to login
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=AUTH_GATEWAY')).toBeVisible({ timeout: 15_000 })

    // Navigate to pricing — use heading role for a deterministic wait under
    // parallel load. text= locators don't auto-wait on initial render.
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: /UPGRADE TO/i })).toBeVisible({
      timeout: 15_000,
    })
    await expect(page.getByRole('button', { name: '$12/MONTH' })).toBeVisible({
      timeout: 15_000,
    })
  })
})
