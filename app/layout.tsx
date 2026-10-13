import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import styles from "./layout.module.css";

import Navigation from "./components/navigation/navigation";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <Toaster richColors position="bottom-right" />
        <Analytics />
        <main className={styles.layout}>{children}</main>
      </body>
    </html>
  );
}
