"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

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

export function LoginForm({ error }: { error?: string }) {
  const [loading, setLoading] = useState(false);

  const errorMessage = error
    ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default
    : null;

  const handleSignIn = async () => {
    setLoading(true);
    await signIn("azure-ad", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative w-full max-w-md mx-4">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Brand header */}
        <div className="bg-[#FFCC00] px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-[#FFCC00] font-bold text-lg">Y</span>
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-xl leading-tight">
                Yango Deli
              </h1>
              <p className="text-gray-700 text-sm">Promo Simulator Platform</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <h2 className="text-gray-900 font-semibold text-xl mb-1">
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

          <p className="mt-6 text-center text-xs text-gray-400">
            SSO access only — contact your admin if you don&apos;t have access.
          </p>
        </div>
      </div>
    </div>
  );
}
