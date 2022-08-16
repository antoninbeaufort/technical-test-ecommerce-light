// polyfill needed until Node 17
import structuredClone from "@ungap/structured-clone";
import type { Size, Color, Product, Supplier } from "@prisma/client";
import { getCartSession } from "~/session.server";

type CartItem = Pick<Size, "id" | "name" | "amount"> & {
  color: Pick<Color, "id" | "hex" | "name" | "slug"> & {
    product: Pick<Product, "id" | "slug" | "name" | "price">;
  };
  supplier: Pick<Supplier, "name" | "address">;
  amount: number;
};

export type Cart = CartItem[];

export async function getCart(request: Request) {
  const cartSession = await getCartSession(request);
  return cartSession.getCart();
}

export function addToCart(cart: Cart, cartItem: Cart[number]): Cart {
  const cartCopy = structuredClone(cart);
  cartCopy.push(cartItem);
  return cartCopy;
}

export function updateAmount(
  cart: Cart,
  id: Cart[number]["id"],
  amount: number
): Cart {
  if (typeof amount !== "number") throw new Error("amount must be a number");
  const cartCopy = structuredClone(cart);
  const item = cartCopy.find((item) => item.id === id);
  if (!item)
    throw new Error("Item not found in cart in order to update amount");
  item.amount = amount;
  return cartCopy;
}

export function removeFromCart(cart: Cart, id: Cart[number]["id"]): Cart {
  const cartCopy = structuredClone(cart);
  const itemIndex = cartCopy.findIndex((item) => item.id === id);
  if (itemIndex !== -1) {
    cartCopy.splice(itemIndex, 1);
  }
  return cartCopy;
}

export async function setCart(request: Request, cart: Cart) {
  const cartSession = await getCartSession(request);
  cartSession.setCart(cart);
  return cartSession.commit();
}
