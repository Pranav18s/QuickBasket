"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { clearUser, selectCurrentUser, setUser } from "../../store/authSlice";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/auth/me", { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Please sign in to view your profile.");
        const payload = await response.json();
        if (!payload.success || !payload.data?.user) throw new Error("Your session could not be verified.");
        if (active) dispatch(setUser(payload.data.user));
      })
      .catch(() => {
        if (active) {
          dispatch(clearUser());
          router.replace("/login");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [dispatch, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      dispatch(clearUser());
      router.replace("/");
      router.refresh();
    }
  };

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4">
        <p className="text-sm font-medium text-stone-500">Loading your profile…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-10 text-stone-900 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800 hover:text-emerald-950">
          <ArrowLeft size={16} /> Back to QuickBasket
        </Link>
        <section className="mt-7 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="bg-emerald-950 px-6 py-8 text-white sm:px-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <UserRound size={28} />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">Your account</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">View profile</h1>
            <p className="mt-2 text-sm text-emerald-100/80">Your QuickBasket sign-in details</p>
          </div>
          <div className="space-y-5 p-6 sm:p-9">
            <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800"><UserRound size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-500">Full name</p>
                <p className="truncate font-bold text-stone-900">{user.name || "QuickBasket customer"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><Mail size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-stone-500">Email address</p>
                <p className="truncate font-bold text-stone-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-stone-100 bg-stone-50 p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800"><ShieldCheck size={20} /></span>
              <div>
                <p className="text-xs font-medium text-stone-500">Account type</p>
                <p className="font-bold capitalize text-stone-900">{user.role || "customer"}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/" className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
                Continue shopping
              </Link>
              <button type="button" onClick={handleSignOut} disabled={signingOut} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-stone-200 px-5 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60">
                <LogOut size={17} /> {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
