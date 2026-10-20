/**
 * packages/shared/src/utils/paise.test.js
 *
 * Automated tests for paise monetary conversion and formatting utilities
 * using Node.js built-in test runner (node:test) and assertions (node:assert/strict).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { toPaise, toRupees, formatINR } = require('./paise');

describe('paise utilities', () => {
  describe('toPaise', () => {
    it('converts integer rupee amounts to paise', () => {
      assert.equal(toPaise(1), 100);
      assert.equal(toPaise(85), 8500);
      assert.equal(toPaise(0), 0);
    });

    it('converts decimal rupee amounts to integer paise', () => {
      assert.equal(toPaise(85.5), 8550);
      assert.equal(toPaise(85.99), 8599);
      assert.equal(toPaise(0.01), 1);
      assert.equal(toPaise(0.5), 50);
    });

    it('handles floating point arithmetic quirks safely using Math.round', () => {
      // 0.1 + 0.2 = 0.30000000000000004 in JavaScript floating point
      assert.equal(toPaise(0.1 + 0.2), 30);
      assert.equal(toPaise(19.99), 1999);
      assert.equal(toPaise(85.499), 8550);
    });
  });

  describe('toRupees', () => {
    it('converts integer paise to rupee amounts', () => {
      assert.equal(toRupees(100), 1);
      assert.equal(toRupees(8500), 85);
      assert.equal(toRupees(0), 0);
    });

    it('converts paise to fractional rupees accurately', () => {
      assert.equal(toRupees(8550), 85.5);
      assert.equal(toRupees(1), 0.01);
      assert.equal(toRupees(50), 0.5);
      assert.equal(toRupees(1999), 19.99);
    });
  });

  describe('formatINR', () => {
    it('formats zero paise correctly with two decimal places', () => {
      assert.equal(formatINR(0), '₹0.00');
    });

    it('formats whole rupee amounts with currency symbol and .00', () => {
      assert.equal(formatINR(100), '₹1.00');
      assert.equal(formatINR(8500), '₹85.00');
    });

    it('formats fractional rupee amounts properly', () => {
      assert.equal(formatINR(8550), '₹85.50');
      assert.equal(formatINR(8505), '₹85.05');
      assert.equal(formatINR(99), '₹0.99');
      assert.equal(formatINR(1), '₹0.01');
    });

    it('formats large amounts with Indian numbering comma grouping', () => {
      // 100,000 paise = 1,000 rupees -> "₹1,000.00"
      // 10,000,000 paise = 100,000 rupees (1 Lakh) -> "₹1,00,000.00"
      assert.equal(formatINR(100000), '₹1,000.00');
      assert.equal(formatINR(10000000), '₹1,00,000.00');
    });
  });
});
