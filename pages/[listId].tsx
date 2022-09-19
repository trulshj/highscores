import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import Layout from "../components/Layout";

import style from "../styles/List.module.css";
import prisma from "../lib/prisma";
import { Score } from "@prisma/client";

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const listId = Number.parseInt(context.query.listId as string);

  const listData = await prisma.list.findUnique({
    where: { id: listId },
    include: { scores: true, owner: { select: { email: true } } },
  });

  if (!listData) {
    return { redirect: { permanent: false, destination: "/404" }, props: {} };
  }

  return { props: { list: listData } };
};

export default function ListEntry({
  list,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath);
  };

  const [deleteMode, setDeleteMode] = useState(false);

  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const { data } = useSession();

  const isAdmin = () => list?.owner.email == data?.user?.email;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const body = { name, score, phone, email };

    const result = await fetch(`api/lists/${list!.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (result.ok) refreshData();
  };

  const handleDraw = async (type: "winner" | "random") => {
    const result = await fetch(`api/lists/${list!.id}/${type}`);
    const data = (await result.json()) as Score;

    let contactString = "";
    if (data.email) contactString += `epost: ${data.email}`;
    if (data.phone) contactString += `telefon: ${data.phone}`;

    if (result.ok) {
      alert(`Vinneren er ${data.name}, de kan nås på ${contactString}`);
    }
  };

  const handleDeleteList = async () => {
    const result = await fetch(`api/lists/${list!.id}`, {
      method: "DELETE",
    });
    if (result.ok) {
      router.replace("/");
    }
  };

  const handleDeleteScore = async (scoreId: number) => {
    const result = await fetch(`api/lists/${list!.id}/${scoreId}`, {
      method: "DELETE",
    });
    if (result.ok) {
      refreshData();
    }
  };

  return (
    <Layout listName={list!.name as string}>
      <div className={style.container}>
        <h1 className={style.listName}>{list!.name}</h1>

        {isAdmin() && (
          <div className={style.adminControls}>
            <button onClick={() => handleDraw("winner")}>Trekk vinner</button>
            <button onClick={() => handleDraw("random")}>
              Trekk tilfeldig
            </button>
            <button onClick={() => setDeleteMode(!deleteMode)}>
              Slettemodus: {deleteMode ? "PÅ" : "AV"}
            </button>
            <button onClick={handleDeleteList} disabled={!deleteMode}>
              Slett Liste
            </button>
          </div>
        )}

        {isAdmin() && (
          <form onSubmit={handleSubmit} className={style.form}>
            <label htmlFor="name">
              Navn
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Navn"
                required
              />
            </label>

            <label htmlFor="score">
              Score
              <input
                id="score"
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Score"
                required
              />
            </label>

            <label htmlFor="phone">
              Telefon
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Telefon"
                pattern="(0047|\+47|47)?\d{8}"
              />
            </label>

            <label htmlFor="email">
              Epost
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Epost"
              />
            </label>

            <button type="submit">Registrer ny score</button>
          </form>
        )}

        <table className={style.table}>
          <thead>
            <tr>
              <th>Navn</th>
              <th>Score</th>
              <th>Telefon</th>
              <th>Epost</th>
              {isAdmin() && <th>Slett</th>}
            </tr>
          </thead>
          <tbody>
            {[...list!.scores]
              .sort((a, b) => a.score - b.score)
              .map((score, idx) => (
                <tr key={idx}>
                  <td>{score.name}</td>
                  <td>{score.score}</td>
                  <td>{score.phone}</td>
                  <td>{score.email}</td>
                  {isAdmin() && (
                    <td style={{ textAlign: "center" }}>
                      <button
                        disabled={!deleteMode}
                        onClick={() => handleDeleteScore(score.id)}
                      >
                        X
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
