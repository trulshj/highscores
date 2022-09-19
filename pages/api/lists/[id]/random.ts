import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const listId = Number.parseInt(req.query.id as string);

  const scores = await prisma.score.findMany({
    where: { listId: listId },
  });

  res.status(200).json(scores[Math.floor(Math.random() * scores.length)]);
}
