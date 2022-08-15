import type { Size } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Size } from "@prisma/client";

export function getSize({
  id,
}: Pick<Size, "id">) {
  return prisma.size.findFirst({
    select: {
      id: true,
      name: true,
      amount: true,
      color: {
        select: {
          id: true,
          hex: true,
          name: true,
          slug: true,
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
            },
          }
        },
      },
      supplier: {
        select: {
          name: true,
          address: true,
        }
      }
    },
    where: { id },
  });
}