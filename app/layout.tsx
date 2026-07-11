import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/top-nav";
import { SystemStatus } from "@/components/system-status";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import { DemoModeProvider } from "@/lib/demo-mode";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Founder OS",
  description: "Private life and business operating system",
  applicationName: "Founder OS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Founder OS",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0c",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-dvh flex flex-col">
        <ServiceWorkerRegister />
        <DemoModeProvider>
          <TopNav />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <SystemStatus />
        </DemoModeProvider>
      </body>
    </html>
  );
}
