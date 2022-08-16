const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const getAmountByIndex = (index) => {
  if (index === 2 || index === 3) return 9;
  if (index === 5) return 0;
  return getRandomArbitrary(0, 20);
};

async function seed() {
  const firstSupplier = await prisma.supplier.create({
    data: {
      name: "Supplier 1",
      email: "supplier-1@example.com",
      phone: "0000000000",
      address: "1 Avenue de la République, 75011 Paris",
    },
  });

  const secondSupplier = await prisma.supplier.create({
    data: {
      name: "Supplier 2",
      email: "supplier-2@example.com",
      phone: "0000000000",
      address: "2 Avenue de la République, 75011 Paris",
    },
  });

  await prisma.product.create({
    data: {
      slug: "t-shirt-simple",
      name: "T-shirt simple",
      order: 1,
      description:
        "Le tee-shirt simple est une nouvelle version honnête d'un classique. Ce tee-shirt est en coton super doux et pré-rétréci pour un vrai confort et une coupe fiable. Ils sont coupés et cousus à la main localement, avec une technique de teinture spéciale qui donne à chaque t-shirt son propre aspect.",
      price: 32,
      colors: {
        create: [
          {
            hex: "#000000",
            name: "Noir",
            order: 1,
            slug: "t-shirt-simple-noir",
            sizes: {
              create: sizes.map((size, index) => ({
                name: size,
                order: index + 1,
                amount: getAmountByIndex(index),
                supplier: {
                  connect: {
                    id: firstSupplier.id,
                  },
                },
              })),
            },
          },
          {
            hex: "#ffffff",
            name: "Blanc",
            order: 2,
            slug: "t-shirt-simple-blanc",
            sizes: {
              create: sizes.map((size, index) => ({
                name: size,
                order: index + 1,
                amount: getAmountByIndex(index),
                supplier: {
                  connect: {
                    id: firstSupplier.id,
                  },
                },
              })),
            },
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      slug: "t-shirt-a-motif-montagnes",
      name: "T-shirt à motif montagnes",
      order: 2,
      description:
        "Le tee-shirt à motif montagnes est une nouvelle version honnête d'un classique. Ce tee-shirt est en coton super doux et pré-rétréci pour un vrai confort et une coupe fiable. Ils sont coupés et cousus à la main localement, avec une technique de teinture spéciale qui donne à chaque t-shirt son propre aspect.",
      price: 36,
      colors: {
        create: [
          {
            hex: "#ad6c6e",
            name: "Corail clair",
            order: 1,
            sizes: {
              create: sizes.map((size, index) => ({
                name: size,
                order: index + 1,
                amount: getAmountByIndex(index),
                supplier: {
                  connect: {
                    id: secondSupplier.id,
                  },
                },
              })),
            },
          },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      slug: "t-shirt-a-motif-points",
      name: "T-shirt à motif points",
      order: 3,
      description:
        "Le tee-shirt à motif points est une nouvelle version honnête d'un classique. Ce tee-shirt est en coton super doux et pré-rétréci pour un vrai confort et une coupe fiable. Ils sont coupés et cousus à la main localement, avec une technique de teinture spéciale qui donne à chaque t-shirt son propre aspect.",
      price: 36,
      colors: {
        create: [
          {
            hex: "#f8e7db",
            name: "Pêche",
            order: 1,
            sizes: {
              create: sizes.map((size, index) => ({
                name: size,
                order: index + 1,
                amount: getAmountByIndex(index),
                supplier: {
                  connect: {
                    id: firstSupplier.id,
                  },
                },
              })),
            },
          },
        ],
      },
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
