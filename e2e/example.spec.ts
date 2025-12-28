import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  
  // Check if the main heading is visible
  await expect(page.getByRole('heading', { name: /SafeMed/i })).toBeVisible()
  
  // Check if sign up button is visible
  await expect(page.getByRole('link', { name: /Get Started/i })).toBeVisible()
  
  // Check if sign in button is visible
  await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible()
})

test('navigation to login page', async ({ page }) => {
  await page.goto('/')
  
  // Click on Sign In link
  await page.getByRole('link', { name: /Sign In/i }).click()
  
  // Should navigate to login page
  await expect(page).toHaveURL(/.*auth\/login/)
  
  // Check if login form is visible
  await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible()
})

test('navigation to signup page', async ({ page }) => {
  await page.goto('/')
  
  // Click on Get Started link
  await page.getByRole('link', { name: /Get Started/i }).click()
  
  // Should navigate to signup page
  await expect(page).toHaveURL(/.*auth\/signup/)
  
  // Check if signup form is visible
  await expect(page.getByRole('heading', { name: /Create Account/i })).toBeVisible()
})

