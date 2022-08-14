import type { Product } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Product } from "@prisma/client";

export function getProductBySlug({
  slug,
}: Pick<Product, "slug">) {
  return prisma.product.findFirst({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      price: true,
      colors: {
        select: {
          id: true,
          hex: true,
          name: true,
          slug: true,
          sizes: {
            select: {
              id: true,
              name: true,
              amount: true,
            },
            orderBy: { order: "asc" },
          }
        },
        orderBy: { order: "asc" },
      }
    },
    where: { slug },
  });
}

export function getProductListItems() {
  return prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      price: true,
      colors: {
        select: {
          id: true,
          hex: true,
          slug: true,
        },
        orderBy: { order: "asc" },
      }
    },
    orderBy: { order: "asc" },
  });
}
