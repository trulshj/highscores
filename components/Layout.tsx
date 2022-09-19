import Head from "next/head";
import React, { ReactNode } from "react";
import Header from "./Header";

type LayoutProps = {
  listName?: string;
  children: ReactNode;
  title?: string;
};

export default function Layout({ listName, children, title }: LayoutProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <title>{title ?? "Variant - Highscores"}</title>
      </Head>
      <div>
        <Header listName={listName} />
        <div style={{ padding: "0 2rem" }}>{children}</div>
      </div>
    </>
  );
}
