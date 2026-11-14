"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, ShoppingBasket } from "lucide-react";
import { setUser } from "../../store/authSlice";

export default function AuthForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const buttonRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleGoogleReady = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts?.id || !buttonRef.current) {
      setError("Google Sign-In is not configured. Check the Google Client ID in your root .env file.");
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setBusy(true);
        setError("");
        try {
          const response = await fetch("/api/v1/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ credential }),
          });
          const payload = await response.json();
          if (!response.ok || !payload.success) {
            throw new Error(payload.message || "Google sign-in failed. Please try again.");
          }
          dispatch(setUser(payload.data.user));
          router.push("/");
          router.refresh();
        } catch (err) {
          setError(err.message || "Unable to connect to QuickBasket. Check that the API and MongoDB are running.");
        } finally {
          setBusy(false);
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      width: 320,
      logo_alignment: "left",
    });
  }, [dispatch, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fbfaf7] px-4 py-10 text-stone-900">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={handleGoogleReady}
      />
      <section className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <ArrowLeft size={16} /> Back to QuickBasket
        </Link>
        <div className="mt-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <ShoppingBasket size={24} />
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight">Welcome to QuickBasket</h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Sign in or create your customer account securely with Google.
        </p>

        <div className="mt-8 flex min-h-12 justify-center" ref={buttonRef} />
        {busy && <p className="mt-3 text-center text-sm text-stone-500">Signing you in…</p>}
        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
            {error}
          </p>
        )}

        <p className="mt-6 text-center text-sm text-stone-600">
          Google authentication is used for both new and returning customers.
        </p>
        <p className="mt-5 text-xs leading-5 text-stone-500">
          Portfolio demo. QuickBasket receives a verified Google identity token and creates its own secure session.
        </p>
      </section>
    </main>
  );
}
