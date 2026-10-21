"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, LockKeyhole, ShoppingBasket } from "lucide-react";
import { setUser } from "../../store/authSlice";

export default function AuthForm({ mode = "login" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Unable to sign in.");
      dispatch(setUser(payload.data.user));
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message || "Unable to connect to the API. Make sure the backend and MongoDB are running.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10 text-stone-900">
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><ArrowLeft size={16} /> Back to QuickBasket</Link>
        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white"><ShoppingBasket size={24} /></div>
        <h1 className="mt-5 text-3xl font-black tracking-tight">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">{isRegister ? "Create a demo customer account to try the API-backed session." : "Sign in to your QuickBasket demo account."}</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {isRegister && <label className="block text-sm font-semibold">Full name<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>}
          <label className="block text-sm font-semibold">Email address<input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /></label>
          <label className="block text-sm font-semibold">Password<input required type="password" minLength={isRegister ? 8 : 1} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isRegister ? "new-password" : "current-password"} className="mt-2 w-full rounded-xl border border-stone-300 px-3.5 py-3 font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />{isRegister && <span className="mt-1 block text-xs font-normal text-stone-500">Use at least 8 characters.</span>}</label>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
          <button type="submit" disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60"><LockKeyhole size={17} />{busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}</button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">{isRegister ? "Already have an account?" : "New to QuickBasket?"}{" "}<Link href={isRegister ? "/login" : "/register"} className="font-bold text-emerald-800 hover:underline">{isRegister ? "Sign in" : "Create an account"}</Link></p>
        <p className="mt-5 text-xs leading-5 text-stone-500">Portfolio demo only. Do not reuse an important password. There is no email verification or password reset yet.</p>
      </section>
    </main>
  );
}
