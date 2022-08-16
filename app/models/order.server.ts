import type { Prisma, Order } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Order } from "@prisma/client";

export function getOrder({ id }: Pick<Order, "id">) {
  return prisma.order.findFirst({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      company: true,
      address: true,
      postalCode: true,
      city: true,
      country: true,
      phone: true,
      total_details_amount_shipping: true,
      total_details_amount_tax: true,
      amount_subtotal: true,
      amount_total: true,
      status: true,
      line_items: true,
      cbLastFourNumbers: true,
      cbExpirationDate: true,
    },
    where: { id },
  });
}

export function createOrder(
  order:
    | (Prisma.Without<
        Prisma.OrderCreateInput,
        Prisma.OrderUncheckedCreateInput
      > &
        Prisma.OrderUncheckedCreateInput)
    | (Prisma.Without<
        Prisma.OrderUncheckedCreateInput,
        Prisma.OrderCreateInput
      > &
        Prisma.OrderCreateInput)
) {
  return prisma.order.create({
    data: order,
  });
}
