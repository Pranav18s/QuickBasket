"use client";

import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBasket, Trash2, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../../store/cartSlice";
import { removeFromWishlist, selectWishlistItems } from "../../store/wishlistSlice";

const money = (paise) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);

export default function WishlistPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const addToBasket = (product) => {
    dispatch(addItem({
      productId: product.id || product.productId,
      slug: product.slug,
      name: product.name,
      pricePaise: product.pricePaise,
      image: product.image,
      packageSize: product.packageSize,
    }));
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="text-lg font-black tracking-tight text-emerald-950">QuickBasket</Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950"><ArrowLeft size={16} /> Continue shopping</Link>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Saved for later</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your wishlist <span className="text-stone-400">({items.length})</span></h1>
          <p className="mt-2 text-sm text-stone-500">Keep your favourite finds close at hand.</p>
        </div>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><Heart size={30} /></span>
            <h2 className="mt-5 text-xl font-extrabold">Your wishlist is empty</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">Tap the heart on any product to save it here and find it again whenever you need it.</p>
            <Link href="/#shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"><ShoppingBag size={17} /> Explore products</Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <article key={product.id || product.productId || product.slug} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="relative aspect-[16/9] bg-stone-100">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => dispatch(removeFromWishlist(product.id || product.productId || product.slug))} aria-label={`Remove ${product.name} from wishlist`} className="absolute right-3 top-3 rounded-full bg-white/95 p-2.5 text-rose-600 shadow hover:bg-rose-50"><Trash2 size={16} /></button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-stone-500">{product.category} {product.packageSize ? `· ${product.packageSize}` : ""}</p>
                  <h2 className="mt-1 min-h-10 text-sm font-bold leading-5">{product.name}</h2>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-lg font-extrabold">{money(product.pricePaise)}</span>
                    <button type="button" onClick={() => addToBasket(product)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-800"><ShoppingBasket size={15} /> Add to basket</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
