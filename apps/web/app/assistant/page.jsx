"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bot, LoaderCircle, Send, ShoppingBasket, Sparkles } from "lucide-react";

const STARTER_PROMPTS = [
  "Help me make a basic Kerala grocery list",
  "Suggest affordable breakfast groceries",
  "What should I buy for a simple vegetarian lunch?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm the QuickBasket demo grocery assistant. I can help you plan a shopping list or discover grocery ideas. Product prices, stock, orders and delivery are demo-only for now.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage(value = draft) {
    const message = value.trim();
    if (!message || busy) return;

    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, { role: "user", content: message }]);
    setDraft("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "The assistant could not answer right now.");
      }
      setMessages((current) => [...current, { role: "assistant", content: payload.data.reply }]);
    } catch (err) {
      setError(err.message || "Could not connect to the assistant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-black text-emerald-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white"><ShoppingBasket size={21} /></span>
            QuickBasket
          </Link>
          <Link href="/" className="text-sm font-semibold text-emerald-800 hover:text-emerald-950">Back to shopping</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><ArrowLeft size={16} /> Home</Link>
        <section className="mt-5 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="bg-emerald-950 p-6 text-white sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><Bot size={26} /></span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">QuickBasket AI</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">Your grocery planning assistant</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-emerald-100">Get ideas for grocery lists, everyday meals and product alternatives. This assistant does not place orders or verify live prices or stock.</p>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {STARTER_PROMPTS.map((prompt) => (
                  <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={busy} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-left text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50">
                    <Sparkles size={13} className="mr-1 inline" />{prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-[52vh] min-h-64 space-y-4 overflow-y-auto rounded-2xl bg-stone-50 p-3 sm:p-4" aria-live="polite">
              {messages.map((item, index) => (
                <div key={`${item.role}-${index}`} className={item.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={item.role === "user" ? "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-emerald-700 px-4 py-3 text-sm leading-6 text-white" : "max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-800"}>
                    {item.content}
                  </div>
                </div>
              ))}
              {busy && <div className="flex items-center gap-2 text-sm text-stone-500"><LoaderCircle size={16} className="animate-spin" /> Thinking…</div>}
            </div>

            {error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</p>}

            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="flex gap-2">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={1200} placeholder="Ask for a grocery list or meal ideas…" disabled={busy} className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-stone-100" />
              <button type="submit" disabled={busy || !draft.trim()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"><Send size={16} /><span className="hidden sm:inline">Send</span></button>
            </form>
            <p className="text-xs leading-5 text-stone-500">AI-generated suggestions may be inaccurate. Do not enter personal, payment or account secrets. Provider usage may incur charges.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
