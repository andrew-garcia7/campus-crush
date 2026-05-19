import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Great_Vibes, Inter, Poppins } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { ClientProviders } from "@/components/providers/client-providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-script-face" });

export const metadata: Metadata = {
  title: "Campus Crush — Where Campus Hearts Connect",
  description: "College-exclusive dating, networking, and AI coaching app",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Campus Crush",
    description: "Where campus hearts connect",
    images: [{ url: "/logo-static.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF8F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${greatVibes.variable} font-body`}>
        {/* <ClientProviders>
          <AppShell>{children}</AppShell>
        </ClientProviders> */}

       <ClientProviders>
  <AppShell>
    {children}
  </AppShell>
</ClientProviders>

      </body>
    </html>
  );
}
