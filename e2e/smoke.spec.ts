import { test, expect } from '@playwright/test'

test.describe('Smoke Tests — All Pages Load', () => {
  test('homepage loads with big board', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1:has-text("BIG BOARD")')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
    await expect(page.getByRole('link', { name: 'GRIDBALLR' })).toBeVisible()
  })

  test('stat matrix loads with prospect table', async ({ page }) => {
    await page.goto('/stats')
    await expect(page.locator('text=STAT_MATRIX')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
  })

  test('compare engine loads', async ({ page }) => {
    await page.goto('/compare')
    await expect(page.locator('text=COMPARE_ENGINE')).toBeVisible()
  })

  test('player profile loads', async ({ page }) => {
    await page.goto('/players/shedeur-sanders')
    await expect(page.locator('text=PLAYER_PROFILE')).toBeVisible()
    await expect(page.locator('h1:has-text("Sanders")')).toBeVisible()
    await expect(page.locator('text=MEASURABLES')).toBeVisible()
  })

  test('mock draft page loads', async ({ page }) => {
    await page.goto('/mock-draft')
    await expect(page.locator('text=MOCK_DRAFT')).toBeVisible()
    await expect(page.locator('text=DRAFT_CONFIGURATION')).toBeVisible()
  })

  test('film terminal loads', async ({ page }) => {
    await page.goto('/film-terminal')
    await expect(page.locator('text=FILM_TERMINAL')).toBeVisible()
    await expect(page.locator('text=VIDEO_FEED')).toBeVisible()
  })

  test('dynasty page loads', async ({ page }) => {
    await page.goto('/dynasty')
    await expect(page.locator('text=DYNASTY_BRIDGE')).toBeVisible()
  })

  test('trade calculator loads', async ({ page }) => {
    await page.goto('/dynasty/calculator')
    await expect(page.locator('text=TRADE_CALCULATOR')).toBeVisible()
    await expect(page.locator('text=TRADE_ANALYSIS')).toBeVisible()
  })

  test('scouts page loads', async ({ page }) => {
    await page.goto('/scouts')
    await expect(page.locator('text=SCOUTS_COMMUNITY')).toBeVisible()
    await expect(page.locator('text=NEW_REPORT')).toBeVisible()
  })

  test('galaxy page loads', async ({ page }) => {
    await page.goto('/galaxy')
    await expect(page.locator('text=COMP_GALAXY')).toBeVisible()
  })

  test('devy tracker loads', async ({ page }) => {
    await page.goto('/dynasty/devy')
    await expect(page.locator('text=DEVY_TRACKER')).toBeVisible()
  })

  test('my board loads', async ({ page }) => {
    await page.goto('/my-board')
    await expect(page.locator('text=DRAG TO REORDER')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
  })

  test('rookie rankings loads', async ({ page }) => {
    await page.goto('/dynasty/rookie-rankings')
    await expect(page.locator('text=ROOKIE_RANKINGS')).toBeVisible()
  })

  test('lottery simulator loads', async ({ page }) => {
    await page.goto('/lottery')
    await expect(page.locator('text=LOTTERY_SIMULATOR')).toBeVisible()
    await expect(page.locator('text=SIMULATE')).toBeVisible()
  })

  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.locator('text=UPGRADE TO')).toBeVisible()
    await expect(page.getByRole('button', { name: '$12/MONTH' })).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=AUTH_GATEWAY')).toBeVisible()
  })

  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('button', { name: 'CREATE_ACCOUNT' })).toBeVisible()
  })
})
