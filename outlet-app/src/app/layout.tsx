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
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW Registered', registration.scope);
                      registration.onupdatefound = () => {
                        const installingWorker = registration.installing;
                        if (installingWorker) {
                          installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // New content is available; please refresh.
                              window.location.reload();
                            }
                          };
                        }
                      };
                    },
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
