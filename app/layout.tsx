import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Modern, futuristic font
import "./globals.css";
import { AppProviders } from "@/components/AppProviders";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bogent - AI-Powered Payments on Mantle",
  description: "Autonomous AI agents for decentralized payments on Mantle Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="black"
          themes={["light", "dark", "black"]}
          enableSystem
          disableTransitionOnChange
        >
          <AppProviders>
            {children}
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

