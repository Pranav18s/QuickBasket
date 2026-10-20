/**
 * packages/shared/src/utils/slug.test.js
 *
 * Automated tests for slug generation utility using Node.js built-in
 * test runner (node:test) and assertions (node:assert/strict).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { toSlug } = require('./slug');

describe('slug utility', () => {
  it('converts basic text to lowercase hyphenated slug', () => {
    assert.equal(toSlug('Ponni Rice'), 'ponni-rice');
    assert.equal(toSlug('Vegetables'), 'vegetables');
  });

  it('handles package sizes and numbers in product names', () => {
    assert.equal(toSlug('Ponni Rice 5 kg'), 'ponni-rice-5-kg');
    assert.equal(toSlug('Coconut Oil 1 L'), 'coconut-oil-1-l');
    assert.equal(toSlug('Fresh Milk 500 ml'), 'fresh-milk-500-ml');
  });

  it('replaces ampersands and special characters cleanly', () => {
    assert.equal(toSlug('Fresh & Organic Fruits!'), 'fresh-and-organic-fruits');
    assert.equal(toSlug('Salt & Pepper (Mix #1)'), 'salt-and-pepper-mix-1');
  });

  it('strips leading and trailing whitespace and hyphens', () => {
    assert.equal(toSlug('   Edappal Groceries   '), 'edappal-groceries');
    assert.equal(toSlug('---Vattamkulam Store---'), 'vattamkulam-store');
  });

  it('collapses multiple consecutive spaces into single hyphens', () => {
    assert.equal(toSlug('Grains    and    Pulses'), 'grains-and-pulses');
  });

  it('converts uppercase characters to lowercase', () => {
    assert.equal(toSlug('DAILY ESSENTIALS'), 'daily-essentials');
  });
});
