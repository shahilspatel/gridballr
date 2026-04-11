import { test, expect } from '@playwright/test'

// Soft paywall behavior on /galaxy:
//  - First N visits: page renders, no paywall overlay.
//  - Visit N+1: overlay appears with the upgrade + waitlist CTAs.
//  - Dismissal: overlay goes away for the rest of the session.
//
// Each test uses a fresh browser context so localStorage starts clean.

test.describe('SoftPaywall on /galaxy', () => {
  test('does not show on first visit', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/galaxy')
    // The paywall is keyed on featureKey="galaxy", freeViews=3.
    await expect(page.getByText('FREE_PREVIEW_USED')).not.toBeVisible()
    await ctx.close()
  })

  test('appears on the 4th visit', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    // Pre-seed localStorage so we don't have to actually navigate 4 times.
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('gb_views_galaxy', '3'))
    await page.goto('/galaxy')
    await expect(page.getByText('FREE_PREVIEW_USED')).toBeVisible()
    await expect(page.getByRole('link', { name: 'UPGRADE_TO_PRO' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'JOIN_WAITLIST_INSTEAD' })).toBeVisible()
    await ctx.close()
  })

  test('dismiss button hides for the session', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('gb_views_galaxy', '5'))
    await page.goto('/galaxy')
    await expect(page.getByText('FREE_PREVIEW_USED')).toBeVisible()
    await page.getByRole('button', { name: 'Keep browsing for now' }).click()
    await expect(page.getByText('FREE_PREVIEW_USED')).not.toBeVisible()
    await ctx.close()
  })

  test('upgrade CTA links to /pricing', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('gb_views_galaxy', '5'))
    await page.goto('/galaxy')
    await page.getByRole('link', { name: 'UPGRADE_TO_PRO' }).click()
    await expect(page).toHaveURL(/\/pricing/)
    await ctx.close()
  })

  test('waitlist CTA links to /early-access', async ({ browser }) => {
    const ctx = await browser.newContext()
    const page = await ctx.newPage()
    await page.goto('/')
    await page.evaluate(() => localStorage.setItem('gb_views_galaxy', '5'))
    await page.goto('/galaxy')
    await page.getByRole('link', { name: 'JOIN_WAITLIST_INSTEAD' }).click()
    await expect(page).toHaveURL(/\/early-access/)
    await ctx.close()
  })
})
