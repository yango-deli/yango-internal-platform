import { getServerSession } from "next-auth";
import { authOptions, devLoginEnabled, azureConfigured } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session && !session.error) redirect("/dashboard");

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0F1115] px-4">
      {/* Ambient brand glow */}
      <div className="pointer-events-none absolute -top-32 -end-32 h-96 w-96 rounded-full bg-[#FFCC00]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -start-24 h-96 w-96 rounded-full bg-[#FFCC00]/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <LoginForm
        error={searchParams.error}
        devLogin={devLoginEnabled}
        azure={azureConfigured}
      />
    </main>
  );
}
