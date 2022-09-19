import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { checkListOwner } from ".";
import prisma from "../../../../lib/prisma";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "PUT":
      updateScore(req, res);
      break;
    case "DELETE":
      deleteScore(req, res);
      break;
    default:
      res.status(405).end("Method not allowed");
  }
}

async function updateScore(req: NextApiRequest, res: NextApiResponse) {
  const { name, score, phone, email } = req.body;
  const listId = Number.parseInt(req.query.id as string);
  const scoreId = Number.parseInt(req.query.scoreId as string);

  if (!name) {
    res.status(400).end("Name missing from body");
    return;
  }

  if (!score) {
    res.status(400).end("Score missing from body");
    return;
  }
  if (!email && !phone) {
    res
      .status(400)
      .end(
        "Both email and phone missing from body, at least one of them must be provided"
      );
    return;
  }

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end("Unauthorized");
    return;
  }

  if (await checkListOwner(listId, req)) {
    res.status(403).end("Not enough priviliges");
    return;
  }

  const result = await prisma.score.update({
    where: { id: scoreId },
    data: { name: name, score: score, phone: phone, email: email },
  });

  res.status(200).json(result);
}

async function deleteScore(req: NextApiRequest, res: NextApiResponse) {
  const listId = Number.parseInt(req.query.id as string);
  const scoreId = Number.parseInt(req.query.scoreId as string);

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end("Unauthorized");
    return;
  }

  if (await checkListOwner(listId, req)) {
    res.status(403).end("Not enough priviliges");
    return;
  }

  const result = await prisma.score.delete({
    where: { id: scoreId },
  });

  res.status(200).json(result);
}
