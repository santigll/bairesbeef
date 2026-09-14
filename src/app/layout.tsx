import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { CartProvider } from "@/lib/cart-context";
import { getSettings } from "@/lib/data";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `${settings.storeName} | ${settings.tagline}`,
    description: `${settings.storeName} — carnicería online. Cortes vacunos, cerdo, pollo, embutidos y achuras. Minorista y mayorista, pedidos por WhatsApp.`,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <html
      lang="es"
      className={`${inter.variable} ${bebas.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <CartProvider>
          <Header storeName={settings.storeName} logoUrl={settings.logoUrl} />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <WhatsAppFloatButton phone={settings.whatsappMinorista} />
        </CartProvider>
      </body>
    </html>
  );
}
