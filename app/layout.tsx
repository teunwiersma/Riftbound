import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import styles from './layout.module.css'

import Navigation from "./components/navigation/navigation";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <Analytics />
        <main className={styles.layout}>
          {children}
        </main>
      </body>
    </html>
  );
}
