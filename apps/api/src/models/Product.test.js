const test = require('node:test');
const assert = require('node:assert/strict');
const Product = require('../models/Product');

test('product schema rejects a product without required fields', async () => {
  const product = new Product({ slug: 'incomplete-product' });
  await assert.rejects(product.validate());
});

test('product schema accepts paise-based price and stock values', async () => {
  const product = new Product({
    name: 'Test Rice',
    slug: 'test-rice',
    category: 'Grains & Pulses',
    categorySlug: 'grains-pulses',
    pricePaise: 12500,
    comparePricePaise: 15000,
    packageSize: '1 kg',
    stock: 4,
  });
  await assert.doesNotReject(product.validate());
});

test('product schema rejects negative stock', async () => {
  const product = new Product({
    name: 'Test Rice',
    slug: 'test-rice-negative-stock',
    category: 'Grains & Pulses',
    categorySlug: 'grains-pulses',
    pricePaise: 12500,
    packageSize: '1 kg',
    stock: -1,
  });
  await assert.rejects(product.validate());
});
