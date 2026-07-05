import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const nunito = Nunito({
  variable: "--nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Academiadesk",
  description: "You want to try abi?",
};

export const viewport: Viewport = {
  height: 1,
  userScalable: false,
  maximumScale: 1,
  minimumScale: 1,
  viewportFit: "contain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
