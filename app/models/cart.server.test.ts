import 'dotenv/config'
import {
  addToCart,
  getCart,
  removeFromCart,
  setCart,
  updateAmount,
} from "./cart.server";

test("getCart return an empty cart without session", async () => {
  expect(await getCart(new Request('http://localhost:3000'))).toEqual([]);
})

test("getCart & setCart work", async () => {
  const cookie = await setCart(new Request('http://localhost:3000'), [
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

test("addToCart return the cart with the new item", async () => {
  expect(
    addToCart(
      [],
      {
        id: "string",
        slug: "string",
        name: "string",
        color: "string",
        size: "string",
        amount: 1,
        price: 32,
      },
    )
  ).toEqual(
    [
      {
        id: "string",
        slug: "string",
        name: "string",
        color: "string",
        size: "string",
        amount: 1,
        price: 32,
      }
    ]
  );
  expect(
    addToCart(
      [
        {
          id: "existingString",
          slug: "existingString",
          name: "existingString",
          color: "existingString",
          size: "existingString",
          amount: 8,
          price: 80,
        }
      ],
      {
        id: "string",
        slug: "string",
        name: "string",
        color: "string",
        size: "string",
        amount: 1,
        price: 32,
      },
    )
  ).toEqual(
    [
      {
        id: "existingString",
        slug: "existingString",
        name: "existingString",
        color: "existingString",
        size: "existingString",
        amount: 8,
        price: 80,
      },
      {
        id: "string",
        slug: "string",
        name: "string",
        color: "string",
        size: "string",
        amount: 1,
        price: 32,
      }
    ]
  );
})

test("updateAmount works", async () => {
  expect(
    updateAmount(
      [
        {
          id: "string",
          slug: "string",
          name: "string",
          color: "string",
          size: "string",
          amount: 1,
          price: 32,
        }
      ],
      "string",
      2
    )
  ).toEqual(
    [
      {
        id: "string",
        slug: "string",
        name: "string",
        color: "string",
        size: "string",
        amount: 2,
        price: 32,
      }
    ]
  );
})

test("removeFromCart works", () => {
  expect(
    removeFromCart(
      [
        {
          id: "string",
          slug: "string",
          name: "string",
          color: "string",
          size: "string",
          amount: 1,
          price: 32,
        }
      ],
      "string"
    )
  ).toEqual([]);
})

// test("addToCart, updateAmount, getCart work", async () => {
//   let cookie = await addToCart(new Request('http://localhost:3000'), {
//     id: "string",
//     slug: "string",
//     name: "string",
//     color: "string",
//     size: "string",
//     amount: 1,
//     price: 32,
//   });
//   cookie = await updateAmount(new Request('http://localhost:3000', {
//     headers: {
//       Cookie: cookie,
//     }
//   }), "string", 2);
//   expect(await getCart(new Request('http://localhost:3000', {
//     headers: {
//       Cookie: cookie,
//     }
//   }))).toEqual([
//     {
//       id: "string",
//       slug: "string",
//       name: "string",
//       color: "string",
//       size: "string",
//       amount: 2,
//       price: 32,
//     }
//   ]);
// })

// test("addToCart, removeFromCart and getCart work", async () => {
//   let cookie = await addToCart(new Request('http://localhost:3000'), {
//     id: "string",
//     slug: "string",
//     name: "string",
//     color: "string",
//     size: "string",
//     amount: 1,
//     price: 32,
//   });
//   console.log(cookie);
//   cookie = await removeFromCart(new Request('http://localhost:3000', {
//     headers: {
//       Cookie: cookie,
//     }
//   }), "string");
//   expect(await getCart(new Request('http://localhost:3000', {
//     headers: {
//       Cookie: cookie,
//     }
//   }))).toEqual([]);
// })