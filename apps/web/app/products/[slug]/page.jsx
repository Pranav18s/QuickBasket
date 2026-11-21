import { notFound } from "next/navigation";
import api from "../../../lib/api";
import { DEMO_PRODUCTS } from "../../../lib/demoData";
import ProductDetailsClient from "../../../components/products/ProductDetailsClient";

async function loadProduct(slug) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    const response = await api.get(`/api/v1/products/${encodeURIComponent(slug)}`, { baseURL: apiBase });
    if (response.data?.success === false) {
      const demo = DEMO_PRODUCTS.find((item) => item.slug === slug && item.active);
      return { product: demo || null, source: demo ? "demo" : "api" };
    }
    {
      const payload = response.data;
      const item = payload?.data?.product;
      if (item) return { product: { ...item, id: item._id || item.id, rating: item.rating ?? "New", reviewsCount: item.reviewsCount ?? 0 }, source: "api" };
    }
  } catch {
    // Local demo fallback keeps the storefront navigable when the API is offline.
  }

  const demo = DEMO_PRODUCTS.find((item) => item.slug === slug && item.active);
  return { product: demo || null, source: "demo" };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { product } = await loadProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description || `Explore ${product.name} in the QuickBasket catalogue.`,
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const { product, source } = await loadProduct(slug);
  if (!product) notFound();

  let relatedProducts = [];
  if (source === "api") {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await api.get("/api/v1/products?limit=50", { baseURL: apiBase });
      {
        const payload = response.data;
        relatedProducts = (payload?.data?.products || [])
          .filter((item) => item.active && item.stock > 0 && item.categorySlug === product.categorySlug && (item._id || item.id) !== product.id)
          .slice(0, 4)
          .map((item) => ({ ...item, id: item._id || item.id, rating: item.rating ?? "New", reviewsCount: item.reviewsCount ?? 0 }));
      }
    } catch {
      relatedProducts = [];
    }
  } else {
    relatedProducts = DEMO_PRODUCTS
      .filter((item) => item.active && item.stock > 0 && item.categorySlug === product.categorySlug && item.id !== product.id)
      .slice(0, 4);
  }

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
