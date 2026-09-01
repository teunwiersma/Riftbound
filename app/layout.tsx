import "./globals.css";

import { Analytics } from "@vercel/analytics/next";

import Navigation from "./components/navigation/navigation";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
