"use client";

import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBasket, Trash2, ShoppingBag } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, selectCartItems, selectCartSubtotalPaise, updateQuantity } from "../../store/cartSlice";

const money = (paise) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotalPaise);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Your picks, together</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Your basket <span className="text-stone-400">({totalItems})</span></h1>
          <p className="mt-2 text-sm text-stone-500">Review your demo basket before continuing.</p>
        </div>

        {items.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"><ShoppingBasket size={30} /></span>
            <h2 className="mt-5 text-xl font-extrabold">Your basket is waiting</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">You haven't added anything yet. Browse the catalogue and add a few everyday favourites.</p>
            <Link href="/#shop" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800"><ShoppingBag size={17} /> Browse groceries</Link>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            <section className="space-y-3">
              {items.map((item) => (
                <article key={item.productId} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-3 sm:gap-5 sm:p-4">
                  <img src={item.image} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl bg-stone-100 object-cover sm:h-28 sm:w-28" />
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-1 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <p className="text-xs text-stone-500">{item.packageSize || "Grocery"}</p>
                      <h2 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-stone-900 sm:text-base">{item.name}</h2>
                      <p className="mt-2 font-extrabold text-emerald-800">{money(item.pricePaise)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center rounded-xl border border-stone-200">
                        <button type="button" aria-label={`Decrease quantity of ${item.name}`} onClick={() => item.quantity <= 1 ? dispatch(removeItem(item.productId)) : dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))} className="p-2.5 text-stone-600 hover:text-emerald-800"><Minus size={14} /></button>
                        <span className="min-w-7 text-center text-sm font-bold">{item.quantity}</span>
                        <button type="button" aria-label={`Increase quantity of ${item.name}`} onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))} className="p-2.5 text-stone-600 hover:text-emerald-800"><Plus size={14} /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold">{money(item.pricePaise * item.quantity)}</span>
                        <button type="button" aria-label={`Remove ${item.name}`} onClick={() => dispatch(removeItem(item.productId))} className="rounded-lg p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-extrabold">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-stone-600"><span>Items ({totalItems})</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between text-stone-600"><span>Delivery</span><span className="font-semibold text-emerald-700">Calculated later</span></div>
                <div className="border-t border-dashed border-stone-200 pt-4">
                  <div className="flex justify-between text-base font-extrabold"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                </div>
              </div>
              <Link href="/checkout" className="mt-6 block w-full rounded-xl bg-emerald-700 px-4 py-3.5 text-center text-sm font-bold text-white transition hover:bg-emerald-800">Continue to checkout</Link>
              <p className="mt-3 text-center text-xs leading-5 text-stone-400">Portfolio demo only. Checkout creates a demo order when the API and database are configured; no real payment is collected.</p>
              <Link href="/#shop" className="mt-4 block text-center text-sm font-bold text-emerald-800 hover:text-emerald-950">+ Add more groceries</Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
