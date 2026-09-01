import Link from "next/link";

import style from './navigation.module.css'

export default function Navigation() {
  return (
    <div className={style.navigation}>
      <nav>
        <Link href='/'>
          Dashboard
        </Link>
        <Link href='/page/catalog'>
          Catalog
        </Link>
        <Link href='/page/collection'>
          Collection
        </Link>
      </nav>
    </div>
  )
}
