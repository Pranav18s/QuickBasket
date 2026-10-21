"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";

const money = (paise) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(paise / 100);
const ORDER_STATUSES = ["confirmed", "preparing", "ready", "completed", "cancelled"];

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockDrafts, setStockDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch("/api/v1/admin/products", { credentials: "same-origin" }),
        fetch("/api/v1/admin/orders", { credentials: "same-origin" }),
      ]);
      const productsPayload = await productsResponse.json();
      const ordersPayload = await ordersResponse.json();
      if (!productsResponse.ok || !productsPayload.success) throw new Error(productsPayload.message || "Admin access is required.");
      if (!ordersResponse.ok || !ordersPayload.success) throw new Error(ordersPayload.message || "Could not load orders.");
      setProducts(productsPayload.data.products || []);
      setOrders(ordersPayload.data.orders || []);
      setStockDrafts(Object.fromEntries((productsPayload.data.products || []).map((product) => [product._id, String(product.stock)])));
    } catch (err) {
      setError(err.message || "Could not connect to the API. Sign in with an admin account and check that MongoDB is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function updateStock(product) {
    setBusyKey(product._id);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/v1/admin/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ stock: Number(stockDrafts[product._id]) }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Could not update stock.");
      setProducts((current) => current.map((item) => item._id === product._id ? payload.data.product : item));
      setNotice(`Stock updated for ${product.name}.`);
    } catch (err) {
      setError(err.message || "Could not update stock.");
    } finally {
      setBusyKey("");
    }
  }

  async function updateOrderStatus(order, status) {
    setBusyKey(order.orderNumber);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/v1/admin/orders/${encodeURIComponent(order.orderNumber)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Could not update order.");
      setOrders((current) => current.map((item) => item.orderNumber === order.orderNumber ? payload.data.order : item));
      setNotice(`Order ${order.orderNumber} updated.`);
    } catch (err) {
      setError(err.message || "Could not update order.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-black text-emerald-950">QuickBasket <span className="font-medium text-stone-400">/ Admin</span></Link>
          <div className="flex items-center gap-3"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><ArrowLeft size={16} /> Storefront</Link><button onClick={loadDashboard} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 px-3 py-2 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50"><RefreshCw size={15} /> Refresh</button></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="flex items-start gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800"><ShieldCheck size={25} /></span><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Store operations</p><h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Admin dashboard</h1><p className="mt-2 text-sm text-stone-600">Manage demo stock and order statuses. The API checks your authenticated admin role.</p></div></div>
        {error && <div role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">{error} {error.toLowerCase().includes("admin") || error.includes("401") || error.includes("403") ? <span><Link href="/login" className="font-bold underline">Sign in</Link> with an admin account. Bootstrap an admin using the documented seed command.</span> : null}</div>}
        {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
        {loading ? <div className="flex items-center gap-2 py-16 text-sm text-stone-500"><LoaderCircle size={18} className="animate-spin" /> Loading store data…</div> : (
          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_1fr]">
            <section className="min-w-0">
              <div className="mb-4 flex items-end justify-between"><div><h2 className="text-xl font-black">Products & stock</h2><p className="mt-1 text-sm text-stone-500">{products.length} products from MongoDB</p></div></div>
              <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {products.length === 0 ? <p className="p-6 text-sm text-stone-500">No products found. Run the demo seed command first.</p> : products.map((product) => (
                  <div key={product._id} className="flex items-center gap-3 border-b border-stone-100 p-4 last:border-b-0">
                    <img src={product.image} alt="" className="h-14 w-14 rounded-xl bg-stone-100 object-cover" />
                    <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-bold">{product.name}</p><p className="mt-1 text-xs text-stone-500">{money(product.pricePaise)} · {product.active ? "Active" : "Hidden"}</p></div>
                    <div className="flex shrink-0 items-center gap-2"><label className="sr-only" htmlFor={`stock-${product._id}`}>Stock for {product.name}</label><input id={`stock-${product._id}`} type="number" min="0" max="1000000" value={stockDrafts[product._id] ?? product.stock} onChange={(event) => setStockDrafts((current) => ({ ...current, [product._id]: event.target.value }))} className="w-20 rounded-lg border border-stone-300 px-2 py-2 text-sm" /><button onClick={() => updateStock(product)} disabled={busyKey === product._id || Number(stockDrafts[product._id]) < 0} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busyKey === product._id ? "Saving" : "Save"}</button></div>
                  </div>
                ))}
              </div>
            </section>
            <section className="min-w-0">
              <h2 className="text-xl font-black">Incoming orders</h2><p className="mt-1 text-sm text-stone-500">{orders.length} most recent orders</p>
              <div className="mt-4 space-y-3">
                {orders.length === 0 ? <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-500">No orders yet. Signed-in customers can create demo COD orders from checkout.</div> : orders.map((order) => (
                  <article key={order.orderNumber} className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-extrabold">{order.orderNumber}</p><p className="mt-1 text-xs text-stone-500">{order.customer?.name || "Customer"} · {new Date(order.createdAt).toLocaleString()}</p></div><p className="font-extrabold">{money(order.subtotalPaise)}</p></div>
                    <p className="mt-3 text-sm text-stone-600">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p>
                    <div className="mt-4 flex items-center justify-between gap-3"><span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold capitalize">{order.status}</span><label className="flex items-center gap-2 text-xs font-semibold">Update status<select value={order.status} disabled={busyKey === order.orderNumber || ["completed", "cancelled"].includes(order.status)} onChange={(event) => updateOrderStatus(order, event.target.value)} className="max-w-36 rounded-lg border border-stone-300 bg-white px-2 py-2 text-xs"><option value={order.status}>{order.status}</option>{ORDER_STATUSES.filter((status) => status !== order.status).map((status) => <option key={status} value={status}>{status}</option>)}</select></label></div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
        <p className="mt-8 text-xs leading-5 text-stone-500">Portfolio demo. For a real shop, add audit logs, role provisioning controls, robust order state transitions, transactional inventory reservations, delivery workflows and operational monitoring.</p>
      </div>
    </main>
  );
}
