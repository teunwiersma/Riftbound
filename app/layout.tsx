import type { Metadata } from "next";

import "./globals.css";

import { CollectionProvider } from "./CollectionProvider";

export const metadata: Metadata = {
  title: "Riftbound Atlas",
  description: "Search and explore the Riftbound card catalog.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <CollectionProvider>{children}</CollectionProvider>
      </body>
    </html>
  );
}
