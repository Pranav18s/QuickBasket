const { test, expect } = require('@playwright/test');

test.describe('QuickBasket storefront and basket', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/QuickBasket/i);
    await expect(page.locator('main')).toBeVisible();
  });

  test('products are displayed on the homepage', async ({ page }) => {
    await page.goto('/');

    const addButtons = page.getByRole('button', {
      name: 'Add',
      exact: true,
    });

    await expect(addButtons.first()).toBeVisible();
  });

  test('customer can add a product from the homepage to the basket', async ({ page }) => {
    await page.goto('/');

    const addButton = page.getByRole('button', {
      name: 'Add',
      exact: true,
    }).first();

    await expect(addButton).toBeVisible();
    await addButton.click();

    // Confirm Redux updated the basket before navigating away.
    const basketLink = page.getByRole('link', {
      name: /Open basket with 1 items/i,
    });
    await expect(basketLink).toBeVisible();

    await basketLink.click();

    // The level-1 heading is unique; the empty-state message is an h2.
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /^Your basket \(1\)$/,
      })
    ).toBeVisible();

    await expect(page.locator('main article').first()).toBeVisible();
  });

  test('customer can add a product from its details page to the basket', async ({ page }) => {
    await page.goto('/');

    const productLink = page.getByRole('link', {
      name: /View .* details/i,
    }).first();

    await expect(productLink).toBeVisible();
    await productLink.click();

    const addToBasketButton = page.getByRole('button', {
      name: /Add 1 to basket/i,
    });

    await expect(addToBasketButton).toBeVisible();
    await addToBasketButton.click();

    // Confirm the product was added before opening the basket.
    const basketLink = page.getByRole('link', {
      name: /^Basket \(1\)$/,
    });
    await expect(basketLink).toBeVisible();

    await basketLink.click();

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: /^Your basket \(1\)$/,
      })
    ).toBeVisible();

    await expect(page.locator('main article').first()).toBeVisible();
  });
});
