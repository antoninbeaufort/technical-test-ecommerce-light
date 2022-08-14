import 'dotenv/config'
import { getCart, addToCart } from "./cart.server";

test("getCart return an empty cart without session", async () => {
  expect(await getCart(new Request('http://localhost:3000'))).toEqual([]);
})

test("getCart return the param of addToCart on empty cart", async () => {
  const cookie = await addToCart(new Request('http://localhost:3000'), {
    id: "string",
    slug: "string",
    name: "string",
    color: "string",
    size: "string",
    amount: 1,
    price: 32,
  });
  expect(await getCart(new Request('http://localhost:3000', {
    headers: {
      Cookie: cookie,
    }
  }))).toEqual([
    {
      id: "string",
      slug: "string",
      name: "string",
      color: "string",
      size: "string",
      amount: 1,
      price: 32,
    }
  ]);
})
