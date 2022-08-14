// polyfill needed until Node 17
import structuredClone from '@ungap/structured-clone';
import { getCartSession } from "~/session.server";

export type Cart = {
  id: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  amount: number;
  price: number;
}[];

export async function getCart(request: Request) {
  const cartSession = await getCartSession(request);
  return cartSession.getCart();
}

export function addToCart(cart: Cart, cartItem: Cart[number]): Cart {
  const cartCopy = structuredClone(cart);
  cartCopy.push(cartItem);
  return cartCopy;
}

export function updateAmount(cart: Cart, size: Cart[number]["size"], amount: number): Cart {
  if (typeof amount !== "number") throw new Error("amount must be a number");
  const cartCopy = structuredClone(cart);
  const item = cartCopy.find(item => item.size === size);
  if (!item) throw new Error("Item not found in cart in order to update amount");
  item.amount = amount;
  return cartCopy;
}

export function removeFromCart(cart: Cart, size: Cart[number]["size"]): Cart {
  const cartCopy = structuredClone(cart);
  const itemIndex = cartCopy.findIndex(item => item.size === size);
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