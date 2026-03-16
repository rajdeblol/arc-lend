import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { HeaderNav } from "@/components/HeaderNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletButton } from "@/components/WalletButton";

const uiFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-ui",
});

const monoFont = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "ArcLend",
  description: "Arcium-aligned private lending and borrowing with encrypted risk logic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${uiFont.variable} ${monoFont.variable}`}>
        <AppProviders>
          <div className="min-h-screen bg-background text-text">
            <header className="border-b-[3px] border-black bg-[rgb(var(--surface-subtle))]">
              <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 px-3 py-3 md:px-5">
                <a href="/" className="arcade-outline bg-[rgb(var(--brand-dark))] px-5 py-2 text-3xl font-bold uppercase tracking-tight text-[#ecf6ff]">
                  ARCLEND
                </a>
                <HeaderNav />
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <WalletButton />
                </div>
              </div>
            </header>
            <main className="mx-auto w-full max-w-[1320px] px-4 pb-16 pt-8 md:px-6">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
