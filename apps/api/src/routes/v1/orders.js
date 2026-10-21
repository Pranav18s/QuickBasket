const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { requireAuth } = require('../../middleware/auth');
const Product = require('../../models/Product');
const Order = require('../../models/Order');

const router = express.Router();
router.use(requireAuth);

function checkValidation(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Please check the order details.', errors.array());
}

const addressRules = [
  body('address.fullName').isString().trim().isLength({ min: 2, max: 100 }),
  body('address.phone').isString().trim().matches(/^[0-9+()\-\s]{8,20}$/),
  body('address.line1').isString().trim().isLength({ min: 3, max: 200 }),
  body('address.line2').optional().isString().trim().isLength({ max: 200 }),
  body('address.locality').isString().trim().isLength({ min: 2, max: 100 }),
  body('address.pincode').isString().trim().matches(/^[0-9A-Za-z\s-]{4,10}$/),
];

router.post(
  '/',
  [
    body('items').isArray({ min: 1, max: 30 }),
    body('items.*.productId').isMongoId(),
    body('items.*.quantity').isInt({ min: 1, max: 99 }),
    ...addressRules,
    body('paymentMethod').optional().isIn(['cod']),
  ],
  asyncHandler(async (req, res) => {
    checkValidation(req);
    const items = req.body.items;
    const reserved = [];
    const orderItems = [];

    try {
      for (const requested of items) {
        const product = await Product.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(requested.productId), active: true, stock: { $gte: Number(requested.quantity) } },
          { $inc: { stock: -Number(requested.quantity) } },
          { new: true }
        );
        if (!product) throw new ApiError(409, 'A product is unavailable or has insufficient stock. Please refresh your basket.');
        reserved.push({ id: product._id, quantity: Number(requested.quantity) });
        orderItems.push({
          product: product._id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          packageSize: product.packageSize,
          unitPricePaise: product.pricePaise,
          quantity: Number(requested.quantity),
        });
      }

      const subtotalPaise = orderItems.reduce((sum, item) => sum + item.unitPricePaise * item.quantity, 0);
      const order = await Order.create({
        orderNumber: `QB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        customer: req.user._id,
        items: orderItems,
        subtotalPaise,
        deliveryAddress: req.body.address,
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        status: 'placed',
      });

      res.status(201).json({ success: true, data: { order } });
    } catch (error) {
      // Compensating stock updates for a failed order creation. For high-volume
      // commerce use a replica-set transaction and an idempotent order workflow.
      await Promise.all(reserved.map((item) => Product.updateOne({ _id: item.id }, { $inc: { stock: item.quantity } })));
      throw error;
    }
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: { orders } });
  })
);

router.get(
  '/:orderNumber',
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber, customer: req.user._id }).lean();
    if (!order) throw new ApiError(404, 'Order not found.');
    res.json({ success: true, data: { order } });
  })
);

module.exports = router;
