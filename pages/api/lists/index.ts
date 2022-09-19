import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";
import { getSession } from "next-auth/react";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      getLists(req, res);
      break;
    case "POST":
      createList(req, res);
      break;
    default:
      res.status(405).end("Method not allowed");
  }
}

async function getLists(_: NextApiRequest, res: NextApiResponse) {
  const result = await prisma.list.findMany();
  res.status(200).json(result);
}

async function createList(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.body;

  if (!name) {
    res.status(400).end("Name missing from body");
    return;
  }

  const session = await getSession({ req });
  if (!session) {
    res.status(401).end("Unauthorized");
    return;
  }
  const result = await prisma.list.create({
    data: {
      name: name,
      owner: { connect: { email: session?.user?.email ?? undefined } },
    },
  });
  res.status(200).json(result);
}
