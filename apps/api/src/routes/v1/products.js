const express = require('express');
const { query, validationResult } = require('express-validator');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const Product = require('../../models/Product');

const router = express.Router();

function validateQuery(req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) throw new ApiError(400, 'Invalid product query.', errors.array());
}

router.get(
  '/',
  [
    query('q').optional().isString().trim().isLength({ max: 100 }),
    query('category').optional().isString().trim().isLength({ max: 80 }),
    query('page').optional().isInt({ min: 1, max: 10000 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('sort').optional().isIn(['featured', 'price_asc', 'price_desc', 'name_asc']),
  ],
  asyncHandler(async (req, res) => {
    validateQuery(req);
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const filter = { active: true, stock: { $gte: 0 } };
    if (req.query.category) filter.categorySlug = req.query.category;
    if (req.query.q) filter.$text = { $search: req.query.q.trim() };

    const sortMap = {
      featured: { featured: -1, name: 1 },
      price_asc: { pricePaise: 1 },
      price_desc: { pricePaise: -1 },
      name_asc: { name: 1 },
    };
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortMap[req.query.sort || 'featured']).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
    if (!product) throw new ApiError(404, 'Product not found.');
    res.json({ success: true, data: { product } });
  })
);

module.exports = router;
