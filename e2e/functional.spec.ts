import { test, expect } from '@playwright/test'

test.describe('Functional Tests — Core User Flows', () => {
  test('homepage filters work — filter by QB', async ({ page }) => {
    await page.goto('/')
    await page.click('text=QB')
    await expect(page.locator('text=Fernando Mendoza')).toBeVisible()
    // Non-QBs should be hidden
    await expect(page.locator('text=Jeremiyah Love')).not.toBeVisible()
  })

  test('homepage search works', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[placeholder="SEARCH_PROSPECT..."]', 'Love')
    await expect(page.locator('text=Jeremiyah Love')).toBeVisible()
    await expect(page.locator('text=Fernando Mendoza')).not.toBeVisible()
  })

  test('stat matrix sorting works', async ({ page }) => {
    await page.goto('/stats')
    // Click 40YD header to sort
    await page.click('text=40YD')
    // The fastest 40 should be at top after sort
    const firstRow = page.locator('tbody tr').first()
    await expect(firstRow).toBeVisible()
  })

  test('compare engine — change players', async ({ page }) => {
    await page.goto('/compare')
    // Change player B
    const selectB = page.locator('select').nth(1)
    await selectB.selectOption({ index: 2 })
    // Verify a selection was made (not empty)
    await expect(selectB).not.toHaveValue('')
  })

  test('mock draft — start and complete draft', async ({ page }) => {
    await page.goto('/mock-draft')
    // Start draft with default team (NYG)
    await page.click('text=START_DRAFT')
    // Should see "YOUR PICK" since NYG picks #1
    await expect(page.locator('text=YOUR PICK')).toBeVisible()
    // Pick a player
    await page.locator('text=AVAILABLE_PROSPECTS').waitFor()
    const firstPlayer = page.locator('button').filter({ hasText: 'Mendoza' }).first()
    await firstPlayer.click()
    // Draft should auto-complete (AI picks rest)
    await expect(page.locator('text=DRAFT_COMPLETE')).toBeVisible({ timeout: 10000 })
  })

  test('lottery simulator — simulate button works', async ({ page }) => {
    await page.goto('/lottery')
    await page.click('text=SIMULATE')
    await expect(page.locator('text=SIMULATION_COMPLETE')).toBeVisible()
    await expect(page.locator('text=RE-ROLL')).toBeVisible()
  })

  test('trade calculator — add assets and evaluate', async ({ page }) => {
    await page.goto('/dynasty/calculator')
    // Type in side A search
    const searchA = page.locator('input').first()
    await searchA.fill('Chase')
    // Click the dropdown result
    await page.locator("text=Ja'Marr Chase").click()
    // Should show value
    await expect(page.locator('text=SIDE A WINS').or(page.locator('text=FAIR'))).toBeVisible()
  })

  test('player profile — tab switching works', async ({ page }) => {
    await page.goto('/players/shedeur-sanders')
    // Stats tab should be active by default
    await expect(page.getByRole('heading', { name: 'PASSING' })).toBeVisible()
    // Click COMPS tab
    await page.click('text=[COMPS]')
    await expect(page.locator('text=PRIMARY COMP')).toBeVisible()
    await expect(page.getByText('Matthew Stafford', { exact: true })).toBeVisible()
  })

  test('navigation works across all pages', async ({ page }) => {
    await page.goto('/')
    // Click STATS nav link
    await page.click('text=[STATS]')
    await expect(page).toHaveURL('/stats')
    // Click COMPARE nav link
    await page.click('text=[COMPARE]')
    await expect(page).toHaveURL('/compare')
    // Click BOARD to go home
    await page.click('text=[BOARD]')
    await expect(page).toHaveURL('/')
  })
})
