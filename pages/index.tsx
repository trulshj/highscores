import type { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/Layout";
import prisma from "../lib/prisma";

import style from "../styles/Home.module.css";

export const getServerSideProps = async () => {
  const listData = await prisma.list.findMany();

  return { props: { lists: listData } };
};

export default function Home({
  lists,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const [name, setName] = useState("");

  const handleCreate = async (e: any) => {
    e.preventDefault();

    const body = { name };
    const result = await fetch(`api/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (result.ok) refreshData();
    else {
      alert("Du må være logget inn for å kunne lage en liste");
    }
  };

  return (
    <Layout>
      <div className={style.container}>
        <h1 className={style.title}>Highscorelister</h1>

        <form onSubmit={handleCreate} className={style.form}>
          <label htmlFor="name">
            Navn
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Among Us"
              required
            />
          </label>
          <button type="submit">Lag ny liste</button>
        </form>

        <ul className={style.list}>
          {lists.map((list, idx) => (
            <li key={idx}>
              <Link href={`/${list.id}`}>
                <a>{list.name}</a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
