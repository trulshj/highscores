import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { Score } from "@prisma/client";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const listId = Number.parseInt(req.query.id as string);

  const scores = await prisma.score.findMany({
    where: { listId: listId },
  });

  res.status(200).json(scores.sort(sortOnScore).reverse()[0]);
}

function sortOnScore(a: Score, b: Score) {
  if (a.score < b.score) {
    return -1;
  }
  if (a.score > b.score) {
    return 1;
  }
  return 0;
}
