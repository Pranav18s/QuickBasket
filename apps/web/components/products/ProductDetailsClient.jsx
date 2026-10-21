"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Heart, Minus, Plus, ShoppingBasket, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addItem, selectCartItemCount } from "../../store/cartSlice";
import { selectWishlistItems, toggleWishlist } from "../../store/wishlistSlice";

const money = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export default function ProductDetailsClient({ product, relatedProducts = [] }) {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartItemCount);
  const wishlistItems = useSelector(selectWishlistItems);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState("");

  const inWishlist = wishlistItems.some(
    (item) => item.id === product.id || item.productId === product.id || item.slug === product.slug
  );
  const discount =
    product.comparePricePaise > product.pricePaise
      ? Math.round((1 - product.pricePaise / product.comparePricePaise) * 100)
      : 0;

  const handleAdd = () => {
    dispatch(
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        pricePaise: product.pricePaise,
        image: product.image,
        packageSize: product.packageSize,
        quantity,
      })
    );
    setNotice(`${product.name} added to your basket`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const handleWishlist = () => {
    dispatch(toggleWishlist(product));
    setNotice(inWishlist ? "Removed from your wishlist" : "Saved to your wishlist");
    window.setTimeout(() => setNotice(""), 2400);
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <div className="bg-emerald-950 px-4 py-2 text-center text-xs font-medium text-emerald-50 sm:text-sm">
        A local grocery demo for Edappal & Vattamkulam
      </div>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="QuickBasket home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">
              <ShoppingBasket size={23} />
            </span>
            <span>
              <span className="block text-xl font-black leading-none text-emerald-950">QuickBasket</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Freshness, simplified</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/wishlist" className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm font-semibold text-stone-700 hover:bg-rose-50 hover:text-rose-600">
              Wishlist ({wishlistItems.length})
            </Link>
            <Link href="/cart" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-3 text-sm font-bold text-white hover:bg-emerald-800">
              <ShoppingBasket size={17} /> Basket ({cartCount})
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950">
          <ArrowLeft size={16} /> Back to shopping
        </Link>

        <section className="mt-6 grid gap-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-2 lg:gap-12 lg:p-10">
          <div className="relative overflow-hidden rounded-2xl bg-stone-100">
            <img src={product.image} alt={product.name} className="aspect-square h-full max-h-[560px] w-full object-cover" />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="flex flex-col py-1 lg:py-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">{product.category}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-stone-950 sm:text-4xl">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-amber-600"><Star size={16} fill="currentColor" /> <strong>{product.rating ?? "New"}</strong></span>
              <span className="text-stone-400">({product.reviewsCount ?? 0} reviews)</span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">{product.packageSize}</span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-black text-stone-950">{money(product.pricePaise)}</span>
              {discount > 0 && <span className="text-base text-stone-400 line-through">{money(product.comparePricePaise)}</span>}
            </div>

            <p className="mt-6 text-base leading-7 text-stone-600">{product.description || "A handy everyday grocery essential for your home."}</p>

            <div className="mt-6 flex items-center gap-2 text-sm">
              <span className={product.stock > 0 ? "h-2.5 w-2.5 rounded-full bg-emerald-500" : "h-2.5 w-2.5 rounded-full bg-red-500"} />
              {product.stock > 0 ? <span className="font-semibold text-emerald-800">In stock</span> : <span className="font-semibold text-red-700">Currently unavailable</span>}
              {product.stock > 0 && <span className="text-stone-500">· Demo stock: {product.stock}</span>}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-xl border border-stone-200">
                <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="p-3 text-stone-700 hover:text-emerald-800 disabled:opacity-40"><Minus size={16} /></button>
                <span className="min-w-10 text-center text-sm font-bold" aria-live="polite">{quantity}</span>
                <button type="button" onClick={() => setQuantity((current) => Math.min(Math.max(1, product.stock), current + 1))} disabled={quantity >= product.stock || product.stock <= 0} aria-label="Increase quantity" className="p-3 text-stone-700 hover:text-emerald-800 disabled:opacity-40"><Plus size={16} /></button>
              </div>
              <button type="button" onClick={handleAdd} disabled={product.stock <= 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300">
                <ShoppingBasket size={18} /> Add {quantity} to basket
              </button>
              <button type="button" onClick={handleWishlist} aria-pressed={inWishlist} className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border transition ${inWishlist ? "border-rose-200 bg-rose-50 text-rose-600" : "border-stone-200 text-stone-600 hover:border-rose-200 hover:text-rose-600"}`} aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}>
                <Heart size={19} fill={inWishlist ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="mt-4 text-xs leading-5 text-stone-500">Portfolio demo only. Stock and prices are sample data; checkout and real payments are not enabled.</p>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">You may also like</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight">More from this aisle</h2>
              </div>
              <Link href="/" className="text-sm font-bold text-emerald-800 hover:text-emerald-950">Browse all</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={`/products/${item.slug}`} className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:shadow-lg">
                  <img src={item.image} alt={item.name} loading="lazy" className="aspect-square w-full bg-stone-100 object-cover" />
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-10 text-sm font-semibold text-stone-800">{item.name}</p>
                    <p className="mt-2 font-extrabold text-stone-950">{money(item.pricePaise)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {notice && (
        <div role="status" className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <Check size={17} className="shrink-0 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}
    </main>
  );
}
