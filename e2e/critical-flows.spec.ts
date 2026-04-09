import { test, expect } from '@playwright/test'

test.describe('Critical User Flows', () => {
  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('button', { name: 'CREATE_ACCOUNT' })).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=AUTH_GATEWAY')).toBeVisible()
  })

  test('pricing page - both tiers visible', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.locator('text=UPGRADE TO')).toBeVisible()
    await expect(page.getByRole('button', { name: '$12/MONTH' })).toBeVisible()
    await expect(page.getByRole('button', { name: '$80/YEAR' })).toBeVisible()
  })

  test('player profile loads with measurables', async ({ page }) => {
    await page.goto('/players/shedeur-sanders')
    await expect(page.locator('text=PLAYER_PROFILE')).toBeVisible()
    await expect(page.locator('h1:has-text("Sanders")')).toBeVisible()
    await expect(page.locator('text=MEASURABLES')).toBeVisible()
  })

  test('big board with prospect ranking', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1:has-text("BIG BOARD")')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
  })

  test('stat matrix loads', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('text=STAT_MATRIX')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
  })

  test('compare engine loads', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.locator('text=COMPARE_ENGINE')).toBeVisible()
  })

  test('mock draft simulator loads', async ({ page }) => {
    await page.goto('/mock-draft')
    await expect(page.locator('text=MOCK_DRAFT')).toBeVisible()
    await expect(page.locator('text=DRAFT_CONFIGURATION')).toBeVisible()
  })

  test('trade calculator loads', async ({ page }) => {
    await page.goto('/dynasty/calculator')
    await expect(page.locator('text=TRADE_CALCULATOR')).toBeVisible()
    await expect(page.locator('text=TRADE_ANALYSIS')).toBeVisible()
  })

  test('film terminal loads', async ({ page }) => {
    await page.goto('/film-terminal')
    await expect(page.locator('text=FILM_TERMINAL')).toBeVisible()
    await expect(page.locator('text=VIDEO_FEED')).toBeVisible()
  })

  test('lottery simulator loads', async ({ page }) => {
    await page.goto('/lottery')
    await expect(page.locator('text=LOTTERY_SIMULATOR')).toBeVisible()
    await expect(page.locator('text=SIMULATE')).toBeVisible()
  })

  test('scouts community loads', async ({ page }) => {
    await page.goto('/scouts')
    await expect(page.locator('text=SCOUTS_COMMUNITY')).toBeVisible()
    await expect(page.locator('text=NEW_REPORT')).toBeVisible()
  })

  test('dynasty page loads', async ({ page }) => {
    await page.goto('/dynasty')
    await expect(page.locator('text=DYNASTY_BRIDGE')).toBeVisible()
  })
})
