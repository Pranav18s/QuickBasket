const express = require('express');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { requireAuth, requireAdmin } = require('../../middleware/auth');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

const router = express.Router();
router.use(requireAuth, requireAdmin);

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Please check the submitted fields.', errors.array());
}

const productRules = [
  body('name').isString().trim().isLength({ min: 2, max: 160 }),
  body('slug').isString().trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  body('description').optional().isString().isLength({ max: 2000 }),
  body('category').isString().trim().isLength({ min: 2, max: 80 }),
  body('categorySlug').isString().trim().isLength({ min: 2, max: 80 }),
  body('pricePaise').isInt({ min: 0, max: 100000000 }),
  body('comparePricePaise').optional().isInt({ min: 0, max: 100000000 }),
  body('packageSize').isString().trim().isLength({ min: 1, max: 80 }),
  body('stock').isInt({ min: 0, max: 1000000 }),
  body('image').optional().isString().isLength({ max: 2000 }),
  body('featured').optional().isBoolean(),
  body('active').optional().isBoolean(),
];

router.get('/products', asyncHandler(async (_req, res) => {
  const products = await Product.find().sort({ updatedAt: -1 }).limit(200).lean();
  res.json({ success: true, data: { products } });
}));

router.post('/products', productRules, asyncHandler(async (req, res) => {
  checkValidation(req);
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: { product } });
}));

router.patch(
  '/products/:id',
  [
    body('name').optional().isString().trim().isLength({ min: 2, max: 160 }),
    body('description').optional().isString().isLength({ max: 2000 }),
    body('pricePaise').optional().isInt({ min: 0, max: 100000000 }),
    body('comparePricePaise').optional().isInt({ min: 0, max: 100000000 }),
    body('stock').optional().isInt({ min: 0, max: 1000000 }),
    body('active').optional().isBoolean(),
    body('featured').optional().isBoolean(),
    body('image').optional().isString().isLength({ max: 2000 }),
  ],
  asyncHandler(async (req, res) => {
    checkValidation(req);
    const allowed = ['name', 'description', 'pricePaise', 'comparePricePaise', 'stock', 'active', 'featured', 'image'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (!Object.keys(updates).length) throw new ApiError(400, 'No supported product fields were supplied.');
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, data: { product } });
  })
);

router.get('/orders', asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('customer', 'name email').sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data: { orders } });
}));

router.patch(
  '/orders/:orderNumber/status',
  [body('status').isIn(['confirmed', 'preparing', 'ready', 'completed', 'cancelled'])],
  asyncHandler(async (req, res) => {
    checkValidation(req);
    const order = await Order.findOneAndUpdate(
      { orderNumber: req.params.orderNumber },
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    if (!order) throw new ApiError(404, 'Order not found.');
    res.json({ success: true, data: { order } });
  })
);

module.exports = router;
