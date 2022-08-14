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

export async function addToCart(request: Request, cartItem: Cart[number]) {
  const cartSession = await getCartSession(request);
  const cart = cartSession.getCart();
  cart.push(cartItem)
  cartSession.setCart(cart);
  return cartSession.commit();
}