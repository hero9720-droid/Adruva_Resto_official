import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adruva Resto - Chain HQ",
  description: "Centralized Chain Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className={`${manrope.className} min-h-full flex flex-col bg-background text-foreground no-scrollbar`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
