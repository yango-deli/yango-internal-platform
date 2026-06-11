"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

const ERROR_MESSAGES: Record<string, string> = {
  AccountDisabled: "Your account has been disabled. Contact your administrator.",
  OAuthSignin: "Error connecting to Microsoft. Please try again.",
  OAuthCallback: "Authentication error. Please try again.",
  OAuthAccountNotLinked: "Account not linked. Please contact your administrator.",
  OAuthCreateAccount: "Could not create your account. Please try again.",
  Callback: "Callback error. Please try again.",
  Configuration: "Server configuration error. Please contact your administrator.",
  AccessDenied: "Access denied.",
  Default: "An error occurred. Please try again.",
};

export function LoginForm({
  error,
  devLogin = false,
  azure = true,
}: {
  error?: string;
  devLogin?: boolean;
  azure?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [devEmail, setDevEmail] = useState("admin@yango.local");

  const errorMessage = error
    ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default
    : null;

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("azure-ad", { callbackUrl: "/dashboard" });
  };

  const handleDevSignIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!devEmail.trim()) return;
    setLoading(true);
    await signIn("dev-login", {
      email: devEmail.trim(),
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="relative z-10 w-full max-w-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-lift overflow-hidden ring-1 ring-white/10">
        {/* Brand header */}
        <div className="relative bg-[#FFCC00] px-8 py-7 overflow-hidden">
          <div className="pointer-events-none absolute -top-10 -end-6 h-28 w-28 rounded-full bg-white/25 blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white/30 shadow-soft">
              <Image
                src="/brand/logo-yellow-button.png"
                alt="Yango Deli"
                width={44}
                height={44}
                className="h-11 w-11 object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-gray-900 font-display font-bold text-2xl leading-none tracking-tight">
                Yango Deli
              </h1>
              <p className="text-gray-800/80 text-sm mt-1">Internal Platform</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <h2 className="text-gray-900 font-display font-semibold text-2xl mb-1 tracking-tight">
            Welcome back
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Sign in with your Yango business account to continue.
          </p>

          {errorMessage && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{errorMessage}</p>
              <p className="text-red-400 text-xs mt-1">Error code: {error}</p>
            </div>
          )}

          {azure && (
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2F2F2F] text-white rounded-xl font-medium hover:bg-[#1a1a1a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
                  <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                  <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                </svg>
              )}
              {loading ? "Signing in..." : "Sign in with Microsoft"}
            </button>
          )}

          {devLogin && (
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">local dev login</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>
              <form onSubmit={handleDevSignIn} className="space-y-3">
                <input
                  type="email"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  placeholder="you@yango.local"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FFCC00]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#FFCC00] text-gray-900 rounded-xl font-medium hover:bg-[#E6B800] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Signing in..." : "Continue with email"}
                </button>
              </form>
              <p className="mt-3 text-center text-[11px] text-gray-400">
                admin@yango.local gets the admin role automatically.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-gray-400">
            SSO access only — contact your admin if you don&apos;t have access.
          </p>
        </div>
      </div>
    </div>
  );
}
