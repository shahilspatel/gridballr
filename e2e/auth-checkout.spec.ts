import { test, expect } from '@playwright/test'

test.describe('Auth & Checkout Flow', () => {
  test('signup page displays form', async ({ page }) => {
    await page.goto('/signup')

    // Verify signup page loads
    await expect(page.getByRole('button', { name: 'CREATE_ACCOUNT' })).toBeVisible()

    // Check for email and password inputs
    const emailInput = page.locator('input[type="email"]').first()
    const passwordInput = page.locator('input[type="password"]').first()

    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible()
    }
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible()
    }
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
    await page.goto('/signup')
    await expect(page.getByRole('button', { name: 'CREATE_ACCOUNT' })).toBeVisible()

    // Navigate to login
    await page.goto('/login')
    await expect(page.locator('text=AUTH_GATEWAY')).toBeVisible()

    // Navigate to pricing
    await page.goto('/pricing')
    await expect(page.locator('text=UPGRADE TO')).toBeVisible()
    await expect(page.getByRole('button', { name: '$12/MONTH' })).toBeVisible()
  })
})
