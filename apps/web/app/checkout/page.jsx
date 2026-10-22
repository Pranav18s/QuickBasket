"use client";

import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, CheckCircle2, LoaderCircle, ShoppingBasket } from "lucide-react";
import { clearCart, selectCartItems, selectCartSubtotalPaise } from "../../store/cartSlice";

const money = (paise) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotalPaise);
  const [form, setForm] = useState({ fullName: "", phone: "", line1: "", line2: "", locality: "", pincode: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!items.length || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          items: items.map((item) => ({
            ...( /^[a-f\d]{24}$/i.test(String(item.productId || "")) ? { productId: item.productId } : {}),
            slug: item.slug,
            quantity: item.quantity,
          })),
          address: form,
          paymentMethod: "cod",
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        if (response.status === 401) throw new Error("Please sign in before placing a demo order.");
        throw new Error(payload.message || "We could not place the order.");
      }
      setOrder(payload.data.order);
      dispatch(clearCart());
    } catch (err) {
      setError(err.message || "Could not connect to the API. Make sure the backend and MongoDB are running.");
    } finally {
      setBusy(false);
    }
  }

  if (order) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 size={54} className="mx-auto text-emerald-600" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Demo order created</p>
          <h1 className="mt-2 text-3xl font-black text-stone-950">Thanks, {order.deliveryAddress.fullName}!</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">Your order record was saved by the backend. This portfolio demo does not dispatch groceries or collect online payment.</p>
          <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-left">
            <div className="flex justify-between gap-3 text-sm"><span className="text-stone-500">Order number</span><strong>{order.orderNumber}</strong></div>
            <div className="mt-3 flex justify-between gap-3 text-sm"><span className="text-stone-500">Subtotal</span><strong>{money(order.subtotalPaise)}</strong></div>
            <div className="mt-3 flex justify-between gap-3 text-sm"><span className="text-stone-500">Payment</span><strong>Cash on delivery (demo)</strong></div>
          </div>
          <Link href="/" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-800">Continue shopping</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
          <Link href="/" className="text-lg font-black text-emerald-950">QuickBasket</Link>
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><ArrowLeft size={16} /> Back to basket</Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">One last step</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Demo checkout</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">This saves an order record and reserves sample database stock. It does not trigger delivery or charge a payment method.</p>

        {!items.length ? (
          <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-8 text-center">
            <ShoppingBasket size={36} className="mx-auto text-stone-400" />
            <h2 className="mt-4 text-xl font-bold">Your basket is empty</h2>
            <Link href="/" className="mt-4 inline-flex rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white">Browse groceries</Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
            <form onSubmit={placeOrder} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
              <h2 className="text-lg font-extrabold">Delivery details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Full name<input required minLength={2} maxLength={100} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" /></label>
                <label className="text-sm font-semibold">Phone number<input required minLength={8} maxLength={20} value={form.phone} onChange={(e) => update("phone", e.target.value)} autoComplete="tel" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" /></label>
                <label className="text-sm font-semibold sm:col-span-2">Address line 1<input required minLength={3} maxLength={200} value={form.line1} onChange={(e) => update("line1", e.target.value)} autoComplete="address-line1" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" /></label>
                <label className="text-sm font-semibold sm:col-span-2">Address line 2 (optional)<input maxLength={200} value={form.line2} onChange={(e) => update("line2", e.target.value)} autoComplete="address-line2" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" /></label>
                <label className="text-sm font-semibold">Locality / town<input required minLength={2} maxLength={100} value={form.locality} onChange={(e) => update("locality", e.target.value)} autoComplete="address-level2" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" /></label>
                <label className="text-sm font-semibold">PIN code<input required minLength={4} maxLength={10} value={form.pincode} onChange={(e) => update("pincode", e.target.value)} autoComplete="postal-code" className="mt-2 w-full rounded-xl border border-stone-300 px-3 py-3 font-normal outline-none focus:border-emerald-600" /></label>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-950">Cash on delivery — demo only</p>
                <p className="mt-1 text-xs leading-5 text-emerald-900">No payment is collected. The order is created only if you are signed in and the backend can validate the current database stock and prices.</p>
              </div>
              {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}{error.toLowerCase().includes("sign in") && <> <Link href="/login" className="font-bold underline">Sign in</Link> or <Link href="/register" className="font-bold underline">create an account</Link>.</>}</div>}
              <button type="submit" disabled={busy || !items.length} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">{busy && <LoaderCircle size={17} className="animate-spin" />}{busy ? "Creating order…" : "Place demo order"}</button>
            </form>

            <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5">
              <h2 className="text-lg font-extrabold">Order summary</h2>
              <div className="mt-4 space-y-3">
                {items.map((item) => <div key={item.productId} className="flex justify-between gap-3 text-sm"><span className="text-stone-600">{item.name} × {item.quantity}</span><strong className="shrink-0">{money(item.pricePaise * item.quantity)}</strong></div>)}
              </div>
              <div className="mt-5 border-t border-stone-200 pt-4">
                <div className="flex justify-between font-extrabold"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <p className="mt-3 text-xs leading-5 text-stone-500">The backend recalculates prices from MongoDB. The browser subtotal is for display only.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
