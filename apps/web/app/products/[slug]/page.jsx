import { notFound } from "next/navigation";
import { DEMO_PRODUCTS } from "../../../lib/demoData";
import ProductDetailsClient from "../../../components/products/ProductDetailsClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = DEMO_PRODUCTS.find((item) => item.slug === slug && item.active);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.name,
    description: product.description || `Explore ${product.name} in the QuickBasket demo catalogue.`,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = DEMO_PRODUCTS.find((item) => item.slug === slug && item.active);

  if (!product) {
    notFound();
  }

  const relatedProducts = DEMO_PRODUCTS
    .filter((item) => item.active && item.stock > 0 && item.categorySlug === product.categorySlug && item.id !== product.id)
    .slice(0, 4);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
