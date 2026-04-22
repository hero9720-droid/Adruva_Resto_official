import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "AdruvaResto | Staff Login",
  description: "Restaurant Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} ${manrope.variable} antialiased no-scrollbar bg-background text-foreground`}>
        <Providers>{children}</Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.worker = navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('SW Registered', reg.scope); },
                    function(err) { console.log('SW Failed', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
