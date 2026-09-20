"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import style from "./navigation.module.css";
import { URLS } from "./config/urls";

export default function Navigation() {
  return (
    <div className={style.navigation}>
      <h1>Rifty Bounded Boys</h1>
      <nav>
        <NavElements />
      </nav>
    </div>
  );
}

function NavElements() {
  const pathname = usePathname();

  return URLS.map(({ href, name }, key) => (
    <Link
      href={href}
      key={key}
      className={href === pathname ? style.active : ""}
    >
      {name}
    </Link>
  ));
}
