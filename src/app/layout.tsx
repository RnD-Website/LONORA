import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Marcellus, Caveat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/Transition";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import ViewCanvas from "@/components/three/ViewCanvas";
import { brand } from "@/lib/content";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-instrument",
});

// Free stand-in for PP Fragment Glare — see globals.css to switch.
const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
});

const hand = Caveat({ subsets: ["latin"], weight: ["400"], variable: "--font-hand-script" });

export const metadata: Metadata = {
  title: { default: `${brand.name} | Interior Architecture`, template: `%s | ${brand.name}` },
  description: brand.description,
  openGraph: { title: brand.name, description: brand.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#17110d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`no-js ${instrument.variable} ${marcellus.variable} ${hand.variable}`}>
      <body className="grain">
        <TransitionProvider>
          <SmoothScroll />
          <Header />
          <main className="relative">{children}</main>
          <Footer />
        </TransitionProvider>
        <ViewCanvas />
        <Preloader />
      </body>
    </html>
  );
}
