"use client";

import Link from "next/link";

import { useCollection } from "./CollectionProvider";

export function SiteHeader() {
  const { ids } = useCollection();
  return (
    <header className="atlas-header">
      <div className="atlas-header-inner">
        <Link className="brand" href="/cards">
          <span className="brand-mark">R</span>
          <span>
            <strong className="brand-name">Riftbound Atlas</strong>
            <span className="brand-subtitle">Card library</span>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link href="/cards">Archive</Link>
          <Link className="collection-link" href="/collection">
            Collection <span>{ids.size}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
