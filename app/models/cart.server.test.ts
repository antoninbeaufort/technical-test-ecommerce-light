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
      name: "string",
      color: {
        id: "string",
        hex: "string",
        name: "string",
        slug: "string",
        product: {
          id: "string",
          slug: "string",
          name: "string",
          price: 32,
        }
      },
      supplier: {
        name: "string",
        address: "string",
      },
      amount: 1,
    },
  ]);

  expect(await getCart(new Request('http://localhost:3000', {
    headers: {
      Cookie: cookie,
    }
  }))).toEqual([
    {
      id: "string",
      name: "string",
      color: {
        id: "string",
        hex: "string",
        name: "string",
        slug: "string",
        product: {
          id: "string",
          slug: "string",
          name: "string",
          price: 32,
        }
      },
      supplier: {
        name: "string",
        address: "string",
      },
      amount: 1,
    },
  ]);
})

test("addToCart return the cart with the new item", () => {
  expect(
    addToCart(
      [],
      {
        id: "string",
        name: "string",
        color: {
          id: "string",
          hex: "string",
          name: "string",
          slug: "string",
          product: {
            id: "string",
            slug: "string",
            name: "string",
            price: 32,
          }
        },
        supplier: {
          name: "string",
          address: "string",
        },
        amount: 1,
      },
    )
  ).toEqual(
    [
      {
        id: "string",
        name: "string",
        color: {
          id: "string",
          hex: "string",
          name: "string",
          slug: "string",
          product: {
            id: "string",
            slug: "string",
            name: "string",
            price: 32,
          }
        },
        supplier: {
          name: "string",
          address: "string",
        },
        amount: 1,
      },
    ]
  );
  expect(
    addToCart(
      [
        {
          id: "existingString",
          name: "existingString",
          color: {
            id: "existingString",
            hex: "existingString",
            name: "existingString",
            slug: "existingString",
            product: {
              id: "existingString",
              slug: "existingString",
              name: "existingString",
              price: 80,
            }
          },
          supplier: {
            name: "existingString",
            address: "existingString",
          },
          amount: 8,
        }
      ],
      {
        id: "string",
        name: "string",
        color: {
          id: "string",
          hex: "string",
          name: "string",
          slug: "string",
          product: {
            id: "string",
            slug: "string",
            name: "string",
            price: 32,
          }
        },
        supplier: {
          name: "string",
          address: "string",
        },
        amount: 1,
      },
    )
  ).toEqual(
    [
      {
        id: "existingString",
        name: "existingString",
        color: {
          id: "existingString",
          hex: "existingString",
          name: "existingString",
          slug: "existingString",
          product: {
            id: "existingString",
            slug: "existingString",
            name: "existingString",
            price: 80,
          }
        },
        supplier: {
          name: "existingString",
          address: "existingString",
        },
        amount: 8,
      },
      {
        id: "string",
        name: "string",
        color: {
          id: "string",
          hex: "string",
          name: "string",
          slug: "string",
          product: {
            id: "string",
            slug: "string",
            name: "string",
            price: 32,
          }
        },
        supplier: {
          name: "string",
          address: "string",
        },
        amount: 1,
      },
    ]
  );
})

test("updateAmount works", () => {
  expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "string",
      2
    )
  ).toEqual(
    [
      {
        id: "string",
        name: "string",
        color: {
          id: "string",
          hex: "string",
          name: "string",
          slug: "string",
          product: {
            id: "string",
            slug: "string",
            name: "string",
            price: 32,
          }
        },
        supplier: {
          name: "string",
          address: "string",
        },
        amount: 2,
      },
    ]
  );
})

test.fails("updateAmount should fail if amount is not a number", async () => {
  await expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "string",
      // @ts-ignore
      "autre type"
    )
  ).rejects.toBe(1);
  await expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "string",
      // @ts-ignore
      false
    )
  ).rejects.toBe(1);
  await expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "string",
      // @ts-ignore
      true
    )
  ).rejects.toBe(1);
  await expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "string",
      // @ts-ignore
      []
    )
  ).rejects.toBe(1);
  await expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "string",
      // @ts-ignore
      {}
    )
  ).rejects.toBe(1);
})

test.fails("updateAmount should fail if size does not exist in cart", async () => {
  await expect(
    updateAmount(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
      ],
      "n'existe pas",
      1
    )
  ).rejects.toBe(1);
})

test("removeFromCart works", () => {
  expect(
    removeFromCart(
      [
        {
          id: "string",
          name: "string",
          color: {
            id: "string",
            hex: "string",
            name: "string",
            slug: "string",
            product: {
              id: "string",
              slug: "string",
              name: "string",
              price: 32,
            }
          },
          supplier: {
            name: "string",
            address: "string",
          },
          amount: 1,
        },
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