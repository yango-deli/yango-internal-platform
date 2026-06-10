import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SupportedLanguage } from "@/types/dashboard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yango Deli — Internal Platform",
  description: "Yango Deli internal management platform — adaptive workspace, HR, and recruitment",
};

async function getUserLanguage(): Promise<SupportedLanguage> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return "he";
    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
      select: { language: true },
    });
    const lang = settings?.language as SupportedLanguage | undefined;
    return lang && ["he", "en", "ru"].includes(lang) ? lang : "he";
  } catch {
    // DB may not be migrated yet or no session — safe default
    return "he";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getUserLanguage();
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers initialLang={lang}>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
