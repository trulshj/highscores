import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { getSession } from "next-auth/react";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      getList(req, res);
      break;
    case "PUT":
      updateList(req, res);
      break;
    case "POST":
      createScore(req, res);
      break;
    case "DELETE":
      deleteList(req, res);
      break;
    default:
      res.status(405).end("Method not allowed");
  }
}

async function getList(req: NextApiRequest, res: NextApiResponse) {
  const listId = Number.parseInt(req.query.id as string);

  const result = await prisma.list.findUnique({
    where: { id: listId },
    include: { scores: true },
  });

  if (!result) {
    res.status(404).end("Could not find list");
    return;
  }

  res.status(200).json(result);
}

async function updateList(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.body;
  const listId = Number.parseInt(req.query.id as string);

  if (!name) {
    res.status(400).end("Name missing from body");
    return;
  }

  if (await checkListOwner(listId, req)) {
    res.status(403).end("Not enough priviliges");
    return;
  }

  const result = await prisma.list.update({
    where: { id: listId },
    data: { name: name },
  });

  res.status(200).json(result);
}

async function createScore(req: NextApiRequest, res: NextApiResponse) {
  const { name, email, phone } = req.body;
  const listId = Number.parseInt(req.query.id as string);

  const score = Number.parseInt(req.body.score);

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

  const list = await prisma.list.findUnique({
    where: { id: listId },
  });

  if (!list) {
    res.status(404).end("Could not find list");
    return;
  }

  if (await checkListOwner(listId, req)) {
    res.status(403).end("Not enough priviliges");
    return;
  }

  const result = await prisma.score.create({
    data: {
      name: name,
      score: score,
      email: email,
      phone: phone,
      listId: list.id,
    },
  });
  res.status(200).json(result);
}

async function deleteList(req: NextApiRequest, res: NextApiResponse) {
  const listId = Number.parseInt(req.query.id as string);

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end("Unauthorized");
    return;
  }

  if (await checkListOwner(listId, req)) {
    res.status(403).end("Not enough priviliges");
    return;
  }

  await prisma.score.deleteMany({
    where: { listId: listId },
  });

  const result = await prisma.list.delete({
    where: { id: listId },
  });

  res.status(200).json(result);
}

export async function checkListOwner(listId: number, req: NextApiRequest) {
  const session = await getSession({ req });
  if (!session) return false;

  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { owner: { select: { email: true } } },
  });

  if (!list) return false;

  return session.user?.email != list.owner.email;
}
