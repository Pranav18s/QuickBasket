"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Heart,
  Leaf,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBasket,
  SlidersHorizontal,
  Star,
  Truck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { DEMO_CATEGORIES, DEMO_PRODUCTS } from "../lib/demoData";
import { addItem, selectCartItemCount } from "../store/cartSlice";
import { selectWishlistItems, toggleWishlist } from "../store/wishlistSlice";

const money = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

function ProductCard({ product, onAdd, inWishlist, onWishlist }) {
  const discount =
    product.comparePricePaise > product.pricePaise
      ? Math.round(
          (1 - product.pricePaise / product.comparePricePaise) * 100
        )
      : 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        <Link href={`/products/${product.slug}`} aria-label={`View ${product.name} details`} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
        {product.badge && (
          <span className="absolute bottom-3 left-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-stone-700 backdrop-blur">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => onWishlist(product)}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={inWishlist}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition ${inWishlist ? "border-rose-200 bg-rose-50 text-rose-600" : "border-white/80 bg-white/90 text-stone-600 hover:text-rose-600"}`}
        >
          <Heart size={17} fill={inWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-1 text-xs font-medium text-stone-500">
          {product.category} <span className="px-1 text-stone-300">/</span> {product.packageSize}
        </p>
        <h3 className="min-h-[2.8rem] text-sm font-semibold leading-5 text-stone-800">
          <Link href={`/products/${product.slug}`} className="transition hover:text-emerald-800">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <Star size={13} fill="currentColor" />
          <span className="font-semibold">{product.rating}</span>
          <span className="text-stone-400">({product.reviewsCount} reviews)</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-stone-900">
              {money(product.pricePaise)}
            </p>
            {discount > 0 && (
              <p className="text-xs text-stone-400 line-through">
                {money(product.comparePricePaise)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={product.stock <= 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <Plus size={15} />
            {product.stock > 0 ? "Add" : "Out of stock"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StorefrontHome() {
  const dispatch = useDispatch();
  const cartCount = useSelector(selectCartItemCount);
  const wishlistItems = useSelector(selectWishlistItems);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [notice, setNotice] = useState("");

  const activeProducts = useMemo(() => {
    let list = DEMO_PRODUCTS.filter((product) => product.active && product.stock > 0);
    if (category !== "all") {
      list = list.filter((product) => product.categorySlug === category);
    }
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery) {
      list = list.filter((product) =>
        [product.name, product.category, product.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      );
    }
    if (sortBy === "price-low") list = [...list].sort((a, b) => a.pricePaise - b.pricePaise);
    if (sortBy === "price-high") list = [...list].sort((a, b) => b.pricePaise - a.pricePaise);
    if (sortBy === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sortBy === "featured") list = [...list].sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return list;
  }, [category, query, sortBy]);

  const isWishlisted = (product) =>
    wishlistItems.some((item) => item.id === product.id || item.productId === product.id || item.slug === product.slug);

  const handleAdd = (product) => {
    dispatch(
      addItem({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        pricePaise: product.pricePaise,
        image: product.image,
        packageSize: product.packageSize,
      })
    );
    setNotice(`${product.name} added to your basket`);
    window.setTimeout(() => setNotice(""), 2400);
  };

  const handleWishlist = (product) => {
    const wasSaved = isWishlisted(product);
    dispatch(toggleWishlist(product));
    setNotice(wasSaved ? "Removed from your wishlist" : "Saved to your wishlist");
    window.setTimeout(() => setNotice(""), 2400);
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <div className="bg-emerald-950 px-4 py-2 text-center text-xs font-medium tracking-wide text-emerald-50 sm:text-sm">
        Fresh picks, everyday prices <span className="mx-2 text-emerald-500">•</span> A local grocery demo for Edappal & Vattamkulam
      </div>

      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#" className="flex shrink-0 items-center gap-2.5" aria-label="QuickBasket home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-md shadow-emerald-900/15">
              <ShoppingBasket size={23} />
            </span>
            <span>
              <span className="block text-xl font-black leading-none tracking-tight text-emerald-950">QuickBasket</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Freshness, simplified</span>
            </span>
          </a>

          <div className="ml-auto hidden max-w-xl flex-1 md:block">
            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 transition focus-within:border-emerald-500 focus-within:bg-white">
              <Search size={18} className="shrink-0 text-stone-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rice, fresh fruits, vegetables..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                aria-label="Search products"
              />
              <kbd className="hidden rounded-md border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-400 lg:inline">SEARCH</kbd>
            </label>
          </div>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <div className="hidden items-center gap-2 rounded-xl px-2 py-2 text-stone-600 lg:flex">
              <MapPin size={18} className="text-emerald-700" />
              <span className="text-xs leading-4"><strong className="block text-stone-800">Delivering around</strong>Edappal, Kerala</span>
            </div>
            <Link href="/assistant" aria-label="Open AI grocery assistant" className="hidden rounded-xl border border-emerald-200 px-3 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 lg:inline-flex">AI Assistant</Link>
            <a href="/wishlist" aria-label={`Wishlist, ${wishlistItems.length} saved items`} className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
              <Heart size={19} />
              {wishlistItems.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white">{wishlistItems.length}</span>}
            </a>
            <a href="/cart" aria-label={`Open basket with ${cartCount} items`} className="relative inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 sm:px-4">
              <ShoppingBasket size={18} />
              <span className="hidden sm:inline">Basket</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-black text-emerald-800">{cartCount}</span>
            </a>
          </div>
        </div>

        <div className="border-t border-stone-100 px-4 py-3 md:hidden">
          <label className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 focus-within:border-emerald-500">
            <Search size={17} className="text-stone-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search groceries..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
              aria-label="Search products"
            />
          </label>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-8 sm:px-6 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="relative z-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800">
            <Leaf size={15} />
            GOOD FOOD. GOOD MOOD.
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
            Your daily basket,
            <span className="mt-1 block text-emerald-700">a little more fresh.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
            From local kitchen essentials to farm-fresh favourites, discover the everyday groceries your home loves.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#shop" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800">
              Shop groceries <ArrowRight size={17} />
            </a>
            <span className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3.5 text-sm font-semibold text-stone-600">
              <Truck size={17} className="text-emerald-700" /> Local-first demo
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-stone-200 pt-5 text-xs font-medium text-stone-500 sm:text-sm">
            <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-700" /> Everyday essentials</span>
            <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-700" /> Clear prices</span>
            <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-700" /> Simple shopping</span>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-emerald-100 sm:min-h-[390px]">
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85"
            alt="Colourful fresh produce arranged at a grocery market"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-emerald-950/5 to-transparent" />
          <div className="absolute left-5 top-5 rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-lg backdrop-blur sm:left-7 sm:top-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">A little closer to home</p>
            <p className="mt-1 text-sm font-extrabold text-emerald-950">Made for local living</p>
          </div>
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-7 sm:left-7 sm:right-7">
            <div className="max-w-xs text-white">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">The everyday edit</p>
              <p className="mt-2 text-2xl font-black leading-tight sm:text-3xl">Fresh finds for your family.</p>
            </div>
            <div className="hidden rounded-2xl bg-white/95 p-3 text-emerald-800 shadow-lg sm:block">
              <ShieldCheck size={26} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200/80 bg-white py-5">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:justify-center sm:border-r sm:border-stone-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Leaf size={19} /></span>
            <span><strong className="block text-sm">Fresh everyday picks</strong><span className="text-xs text-stone-500">Familiar kitchen essentials</span></span>
          </div>
          <div className="flex items-center gap-3 sm:justify-center sm:border-r sm:border-stone-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><Star size={19} /></span>
            <span><strong className="block text-sm">Customer favourites</strong><span className="text-xs text-stone-500">Explore the demo catalogue</span></span>
          </div>
          <div className="flex items-center gap-3 sm:justify-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700"><MapPin size={19} /></span>
            <span><strong className="block text-sm">Rooted in Kerala</strong><span className="text-xs text-stone-500">Designed for Edappal & Vattamkulam</span></span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Aisle by aisle</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">Shop by category</h2>
            <p className="mt-2 text-sm text-stone-500">Find your everyday favourites in a few clicks.</p>
          </div>
          <button type="button" onClick={() => { setCategory("all"); setQuery(""); }} className="hidden items-center gap-1 text-sm font-bold text-emerald-800 hover:text-emerald-950 sm:flex">
            View all <ArrowRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <button type="button" onClick={() => setCategory("all")} className={`group rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${category === "all" ? "border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700" : "border-stone-200 bg-white"}`}>
            <span className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><ShoppingBasket size={27} /></span>
            <span className="block text-xs font-bold leading-4 text-stone-800">All groceries</span>
          </button>
          {DEMO_CATEGORIES.map((item) => (
            <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={`group rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${category === item.slug ? "border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700" : "border-stone-200 bg-white"}`}>
              <span className="mb-3 block aspect-square overflow-hidden rounded-xl bg-stone-100">
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              </span>
              <span className="block text-xs font-bold leading-4 text-stone-800">{item.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="shop" className="bg-[#f3f2ec] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Picked for your pantry</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950 sm:text-3xl">
                {category === "all" ? "Popular in your basket" : DEMO_CATEGORIES.find((item) => item.slug === category)?.name || "Popular in your basket"}
              </h2>
              <p className="mt-2 text-sm text-stone-500">{activeProducts.length} products to explore in this demo catalogue.</p>
            </div>
            <label className="flex items-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-600 sm:self-auto">
              <SlidersHorizontal size={16} />
              <span className="text-xs font-semibold">Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="max-w-[145px] bg-transparent text-xs font-bold text-stone-800 outline-none">
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            <button type="button" onClick={() => setCategory("all")} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === "all" ? "bg-emerald-800 text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-300"}`}>All products</button>
            {DEMO_CATEGORIES.map((item) => (
              <button key={item.id} type="button" onClick={() => setCategory(item.slug)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${category === item.slug ? "bg-emerald-800 text-white" : "border border-stone-200 bg-white text-stone-600 hover:border-emerald-300"}`}>{item.name}</button>
            ))}
          </div>

          {query && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm">
              <span className="text-stone-600">Results for <strong className="text-stone-900">“{query}”</strong></span>
              <button type="button" onClick={() => setQuery("")} className="font-bold text-emerald-800">Clear search</button>
            </div>
          )}

          {activeProducts.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
              {activeProducts.slice(0, 16).map((product) => (
                <ProductCard key={product.id} product={product} onAdd={handleAdd} inWishlist={isWishlisted(product)} onWishlist={handleWishlist} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
              <Search size={30} className="mx-auto text-stone-400" />
              <h3 className="mt-3 font-bold text-stone-800">No products found</h3>
              <p className="mt-1 text-sm text-stone-500">Try a different search or choose another category.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-4 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white">Reset filters</button>
            </div>
          )}

          {activeProducts.length > 16 && (
            <p className="mt-6 text-center text-xs text-stone-500">Showing 16 products. Use search and category filters to find more.</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-9 text-white sm:px-10 sm:py-12 lg:px-14">
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/5" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-100"><ShieldCheck size={14} /> Portfolio project</div>
              <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">A smarter little shop, built for the neighbourhood.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100/75">QuickBasket is a full-stack portfolio demo. Product browsing, wishlist and basket interactions use sample data; real ordering, payment and delivery are not enabled.</p>
            </div>
            <a href="#shop" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-emerald-950 transition hover:bg-emerald-50">Explore products <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-emerald-950"><ShoppingBasket size={17} /> QuickBasket <span className="font-normal text-stone-400">© 2026</span></div>
          <p>Made as a portfolio project for Edappal & Vattamkulam, Kerala.</p>
          <p className="inline-flex items-center gap-1"><ShieldCheck size={13} /> Demo only — no real transactions</p>
        </div>
      </footer>

      {notice && (
        <div role="status" className="fixed bottom-4 left-1/2 z-50 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <Check size={17} className="shrink-0 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}
    </main>
  );
}
