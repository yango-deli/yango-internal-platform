import type { Metadata } from "next";
import { Rubik, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

// Rubik covers Latin, Cyrillic and Hebrew — one family for all three UI languages.
const rubik = Rubik({
  subsets: ["latin", "latin-ext", "cyrillic", "hebrew"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

// Space Grotesk is the expressive display accent (wordmark, headings, KPI numbers);
// gracefully falls back to Rubik for scripts it doesn't cover.
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yango Deli — Internal Platform",
  description: "Yango Deli internal platform — recruitment, simulation and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${rubik.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}
