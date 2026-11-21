/**
 * apps/web/lib/dataService.js
 *
 * Client-safe data service for QuickBasket 2026.
 * Implements search, category filtering, sorting, pagination, and state mutations.
 * In Phase 6+, these functions will delegate to Express /api/v1 endpoints.
 */

import {
  DEMO_PRODUCTS,
  DEMO_CATEGORIES,
  DEMO_SERVICE_AREAS,
  DEMO_ORDERS,
  DEMO_CUSTOMERS,
  DEMO_USER_ADDRESSES,
} from './demoData';

// In-memory mutable arrays for demo state interactions during current session
let productsCache = [...DEMO_PRODUCTS];
let ordersCache = [...DEMO_ORDERS];
let serviceAreasCache = [...DEMO_SERVICE_AREAS];
let categoriesCache = [...DEMO_CATEGORIES];
let addressesCache = [...DEMO_USER_ADDRESSES];

export const dataService = {
  // ─── Products ──────────────────────────────────────────────
  getProducts({
    category = '',
    query = '',
    minPrice = 0,
    maxPrice = Infinity,
    sortBy = 'featured', // 'featured', 'price_asc', 'price_desc', 'rating', 'newest'
    activeOnly = true,
    page = 1,
    limit = 12,
  } = {}) {
    let list = productsCache.filter((item) => {
      if (activeOnly && !item.active) return false;
      if (category && item.categorySlug !== category && item.category !== category) return false;
      if (minPrice && item.pricePaise < minPrice) return false;
      if (maxPrice && item.pricePaise > maxPrice) return false;
      if (query) {
        const q = query.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCategory) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.pricePaise - b.pricePaise);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.pricePaise - a.pricePaise);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // featured default
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    const total = list.length;
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  getProductBySlug(slug) {
    return productsCache.find((p) => p.slug === slug) || null;
  },

  getProductById(id) {
    return productsCache.find((p) => p.id === id) || null;
  },

  getFeaturedProducts(limit = 8) {
    return productsCache.filter((p) => p.featured && p.active).slice(0, limit);
  },

  getRelatedProducts(categorySlug, currentId, limit = 4) {
    return productsCache
      .filter((p) => p.active && p.categorySlug === categorySlug && p.id !== currentId)
      .slice(0, limit);
  },

  // ─── Admin Product Management ──────────────────────────────
  createProduct(productData) {
    const id = `prod_${Date.now()}`;
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = {
      id,
      slug,
      rating: 5.0,
      reviewsCount: 0,
      active: true,
      ...productData,
    };
    productsCache.unshift(newProduct);
    return newProduct;
  },

  updateProduct(id, updates) {
    const index = productsCache.findIndex((p) => p.id === id);
    if (index === -1) return null;
    productsCache[index] = { ...productsCache[index], ...updates };
    return productsCache[index];
  },

  toggleProductActive(id) {
    const index = productsCache.findIndex((p) => p.id === id);
    if (index === -1) return null;
    productsCache[index].active = !productsCache[index].active;
    return productsCache[index];
  },

  updateStock(id, newStock) {
    const index = productsCache.findIndex((p) => p.id === id);
    if (index === -1) return null;
    productsCache[index].stock = Math.max(0, parseInt(newStock, 10));
    return productsCache[index];
  },

  // ─── Categories ────────────────────────────────────────────
  getCategories() {
    return categoriesCache;
  },

  getCategoryBySlug(slug) {
    return categoriesCache.find((c) => c.slug === slug) || null;
  },

  createCategory(categoryData) {
    const id = `cat_${Date.now()}`;
    const newCat = { id, itemCount: 0, ...categoryData };
    categoriesCache.push(newCat);
    return newCat;
  },

  updateCategory(id, updates) {
    const index = categoriesCache.findIndex((c) => c.id === id);
    if (index === -1) return null;
    categoriesCache[index] = { ...categoriesCache[index], ...updates };
    return categoriesCache[index];
  },

  // ─── Service Areas ─────────────────────────────────────────
  getServiceAreas() {
    return serviceAreasCache;
  },

  checkServiceability(pinCode) {
    const cleanPin = String(pinCode).trim();
    const area = serviceAreasCache.find((a) => a.pinCode === cleanPin);
    if (area && area.enabled) {
      return { serviceable: true, area };
    }
    return { serviceable: false, area: null };
  },

  toggleServiceArea(id) {
    const index = serviceAreasCache.findIndex((a) => a.id === id);
    if (index === -1) return null;
    serviceAreasCache[index].enabled = !serviceAreasCache[index].enabled;
    return serviceAreasCache[index];
  },

  // ─── Orders ────────────────────────────────────────────────
  getOrders({ status = '', query = '' } = {}) {
    let list = [...ordersCache];
    if (status && status !== 'all') {
      list = list.filter((o) => o.orderStatus === status);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getOrderById(id) {
    return ordersCache.find((o) => o.id === id) || null;
  },

  createOrder({ items, address, paymentMethod = 'Cash on Delivery (Demo COD)' }) {
    const subtotalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
    // Determine delivery fee based on PIN code
    const serviceCheck = this.checkServiceability(address.pinCode);
    const deliveryFeePaise = serviceCheck.serviceable ? serviceCheck.area.deliveryFeePaise : 3000;
    const totalPaise = subtotalPaise + deliveryFeePaise;

    const newOrder = {
      id: `QB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      customer: {
        name: address.recipientName,
        phone: address.phone,
        email: 'customer@quickbasket.demo',
      },
      items,
      address,
      subtotalPaise,
      deliveryFeePaise,
      totalPaise,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: new Date().toISOString(),
          note: 'Demo order placed successfully by customer.',
        },
      ],
    };

    ordersCache.unshift(newOrder);

    // Decrement stock in local cache
    items.forEach((item) => {
      const p = productsCache.find((prod) => prod.id === item.productId || prod.slug === item.slug);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus, note = '') {
    const order = ordersCache.find((o) => o.id === orderId);
    if (!order) return null;
    order.orderStatus = newStatus;
    if (newStatus === 'delivered') {
      order.paymentStatus = 'paid';
    }
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${newStatus}`,
    });
    return order;
  },

  // ─── Addresses ─────────────────────────────────────────────
  getUserAddresses() {
    return addressesCache;
  },

  addAddress(addressData) {
    const newAddr = {
      id: `addr_${Date.now()}`,
      isDefault: addressesCache.length === 0,
      ...addressData,
    };
    if (newAddr.isDefault) {
      addressesCache.forEach((a) => (a.isDefault = false));
    }
    addressesCache.push(newAddr);
    return newAddr;
  },

  deleteAddress(id) {
    addressesCache = addressesCache.filter((a) => a.id !== id);
    if (addressesCache.length > 0 && !addressesCache.some((a) => a.isDefault)) {
      addressesCache[0].isDefault = true;
    }
    return addressesCache;
  },

  setDefaultAddress(id) {
    addressesCache.forEach((a) => {
      a.isDefault = a.id === id;
    });
    return addressesCache;
  },

  // ─── Customers & Analytics ─────────────────────────────────
  getCustomers() {
    return DEMO_CUSTOMERS;
  },

  getAdminMetrics() {
    const totalOrders = ordersCache.length;
    const totalRevenuePaise = ordersCache.reduce((sum, o) => sum + o.totalPaise, 0);
    const lowStockCount = productsCache.filter((p) => p.stock < 15).length;
    const activeProductsCount = productsCache.filter((p) => p.active).length;

    return {
      totalOrders,
      totalRevenuePaise,
      lowStockCount,
      activeProductsCount,
      activeCustomersCount: DEMO_CUSTOMERS.filter((c) => c.role !== 'admin').length,
    };
  },
};
