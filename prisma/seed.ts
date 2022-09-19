import { PrismaClient, Prisma, List } from "@prisma/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: "Truls Henrik",
    email: "thj@epost.com",
    lists: {
      create: [
        {
          name: "Among Us",
        },
        { name: "Fall Guys" },
      ],
    },
  },
];

const scoreData = (listId: number): Prisma.ScoreCreateInput[] => {
  return [
    {
      list: { connect: { id: listId } },
      score: 11,
      name: "Bob",
      email: "bob@email.com",
      phone: "94039460",
    },
    {
      list: { connect: { id: listId } },
      score: 11,
      name: "Billy",
      email: "billy@email.com",
      phone: "99509950",
    },
  ];
};

async function main() {
  console.log(`Start seeding ...`);
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);

    const lists = await prisma.list.findMany();
    for (const l of lists) {
      for (const s of scoreData(l.id)) {
        const score = await prisma.score.create({ data: s });
        console.log(`Created score with id: ${score.id}`);
      }
    }
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
