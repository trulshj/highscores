/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

import style from "./Header.module.css";

type HeaderProps = {
  listName?: string;
};

export default function Header({ listName }: HeaderProps) {
  const { data: session } = useSession();

  return (
    <nav className={style.container}>
      <img src="/variant-color.svg" alt="Variant Logo" className={style.logo} />
      <h3 className={style.left}>
        <Link href="/">
          <a className={style.bold}>Highscorelister</a>
        </Link>

        {listName && (
          <>
            {" > "}
            <Link href="/">
              <a className={style.bold}>{listName}</a>
            </Link>
          </>
        )}
      </h3>

      {!session ? (
        <div className={style.right}>
          <Link href="/api/auth/signin">
            <a>Logg inn</a>
          </Link>
        </div>
      ) : (
        <div className={style.right}>
          <p>
            {session.user?.name} ({session.user?.email})
          </p>
          <button onClick={() => signOut()}>Logg ut</button>
        </div>
      )}
    </nav>
  );
}
