require('../config/env');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Product = require('../models/Product');

const products = [
  {
    name: 'Palakkadan Matta Rice (Vadi Matta)',
    slug: 'palakkadan-matta-rice',
    description: 'Kerala red parboiled Matta rice, a classic everyday staple.',
    category: 'Grains & Pulses',
    categorySlug: 'grains-pulses',
    pricePaise: 27500,
    comparePricePaise: 32000,
    packageSize: '5 kg',
    stock: 45,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    featured: true,
    active: true,
  },
  {
    name: 'Premium Ponni Boiled Rice',
    slug: 'premium-ponni-rice',
    description: 'Everyday boiled rice for home cooking.',
    category: 'Grains & Pulses',
    categorySlug: 'grains-pulses',
    pricePaise: 29500,
    comparePricePaise: 33000,
    packageSize: '5 kg',
    stock: 38,
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80',
    featured: true,
    active: true,
  },
  {
    name: 'Nendran Bananas',
    slug: 'nendran-bananas',
    description: 'A Kerala favourite for snacks, steaming and cooking.',
    category: 'Fresh Fruits',
    categorySlug: 'fruits',
    pricePaise: 6500,
    comparePricePaise: 7500,
    packageSize: '1 kg',
    stock: 24,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
    featured: true,
    active: true,
  },
  {
    name: 'Fresh Farm Eggs',
    slug: 'fresh-farm-eggs',
    description: 'A convenient protein staple for breakfast and meals.',
    category: 'Dairy & Breakfast',
    categorySlug: 'dairy-breakfast',
    pricePaise: 7500,
    comparePricePaise: 8500,
    packageSize: '6 pieces',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
    featured: false,
    active: true,
  },
  {
    name: 'Coconut Oil',
    slug: 'coconut-oil',
    description: 'Everyday coconut oil for Kerala cooking.',
    category: 'Oils & Masalas',
    categorySlug: 'oils-masalas',
    pricePaise: 18500,
    comparePricePaise: 21000,
    packageSize: '1 L',
    stock: 18,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
    featured: false,
    active: true,
  },
];

async function main() {
  await connectDB();
  for (const product of products) {
    await Product.updateOne({ slug: product.slug }, { $set: product }, { upsert: true, runValidators: true });
  }
  console.log(`Seeded/updated ${products.length} QuickBasket demo products.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('[Seed] Failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
