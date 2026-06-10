import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { LanguageSync } from "@/components/providers/language-sync";
import type { SupportedLanguage } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.error === "AccountDisabled") {
    redirect("/login" + (session?.error ? `?error=${session.error}` : ""));
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
    select: { language: true },
  });
  const language = (settings?.language ?? "he") as SupportedLanguage;

  return (
    <div className="flex min-h-screen bg-gray-50" dir={language === "he" ? "rtl" : "ltr"}>
      <LanguageSync language={language} />
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
