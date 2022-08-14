import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";
import { CurrencyDollarIcon, GlobeIcon } from "@heroicons/react/outline";
import { StarIcon } from "@heroicons/react/solid";

import {
  getOtherProductListItems,
  getProductBySlug,
} from "~/models/product.server";
import { classNames, getProductImageUrl } from "~/utils";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const {
    _action,
    sizeId,
    // quantity: rawQuantity,
  } = Object.fromEntries(formData);
  console.log(_action, sizeId);
  if (typeof sizeId !== "string") throw new Error("sizeId is not a string");
  // const { headers } = await getOrCreateCart(request);

  return json(
    {
      success: true,
    }
    // {
    //   headers,
    // }
  );
};

type LoaderData = {
  otherProductListItems: Awaited<ReturnType<typeof getOtherProductListItems>>;
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "slug not found");

  const product = await getProductBySlug({ slug: params.slug });
  if (!product) {
    throw new Response("Not Found", { status: 404 });
  }
  const otherProductListItems = await getOtherProductListItems({
    slug: params.slug,
  });
  return json<LoaderData>({ otherProductListItems, product });
};

const details = [
  "Seulement avec les meilleurs matériaux",
  "Fabriqué localement de manière responsable",
  "Pré-lavé",
  "Machine à froid avec des couleurs similaires",
];

const policies = [
  {
    name: "Livraison internationale",
    icon: GlobeIcon,
    description: "Recevez votre commande en 2 jours ouvrables",
  },
  {
    name: "Fidélité récompensée",
    icon: CurrencyDollarIcon,
    description: "Ne regardez pas les autres T-shirts",
  },
];
const reviews = {
  average: 3.9,
  totalCount: 512,
  featured: [
    {
      id: 1,
      title: "Je n'en dirai jamais assez de bien",
      rating: 5,
      content: `
        <p>J'ai été très satisfaite de l'expérience d'achat globale. Ma commande comprenait même un petit mot personnel écrit à la main, ce qui m'a ravi !</p>
        <p>La qualité du produit est incroyable, il a l'air et se sent encore mieux que ce que j'avais prévu. C'est génial ! Je recommanderais volontiers ce magasin à mes amis. Et, maintenant que j'y pense... En fait, je l'ai fait, plusieurs fois !</p>
      `,
      author: "Risako M",
      date: "16 juillet 2022",
      datetime: "2022-07-16",
    },
    // More reviews...
  ],
};

export default function Product() {
  const fetcher = useFetcher();
  const { otherProductListItems, product } = useLoaderData() as LoaderData;
  const getColorById = (id: string) => {
    return product.colors.find((color) => color.id === id) as NonNullable<
      typeof product.colors[0]
    >;
  };
  const [selectedColor, setSelectedColor] = useState(product.colors[0].id);
  const [selectedSize, setSelectedSize] = useState(
    product.colors.find((color) => color.id === selectedColor)?.sizes[2].id
  );
  // on change color, change size to
  useEffect(() => {
    const defaultSize = product.colors.find(
      (color) => color.id === selectedColor
    )!.sizes[2];
    if (defaultSize.amount) {
      setSelectedSize(
        product.colors.find((color) => color.id === selectedColor)?.sizes[2].id
      );
      return;
    }
    setSelectedSize(
      product.colors
        .find((color) => color.id === selectedColor)
        ?.sizes.find((size) => !!size.amount)?.id
    );
  }, [selectedColor, product.colors]);

  return (
    <div className="bg-white">
      <main className="mx-auto mt-8 max-w-2xl px-4 pb-16 sm:px-6 sm:pb-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="flex justify-between">
              <h1 className="text-xl font-medium text-gray-900">
                {product.name}
              </h1>
              <p className="text-xl font-medium text-gray-900">
                {product.price} €
              </p>
            </div>
            {/* Reviews */}
            <div className="mt-4">
              <h2 className="sr-only">Avis</h2>
              <div className="flex items-center">
                <p className="text-sm text-gray-700">
                  {reviews.average.toLocaleString("fr-FR")}
                  <span className="sr-only"> sur 5 étoiles</span>
                </p>
                <div className="ml-1 flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={classNames(
                        reviews.average > rating
                          ? "text-yellow-400"
                          : "text-gray-200",
                        "h-5 w-5 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div aria-hidden="true" className="ml-4 text-sm text-gray-300">
                  ·
                </div>
                <div className="ml-4 flex">
                  <a
                    href="#"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Voir les {reviews.totalCount} avis
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Image gallery */}
          <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
            <h2 className="sr-only">Images</h2>
            <div>
              <img
                src={getProductImageUrl(
                  product,
                  product.colors.findIndex(
                    (color) => color.id === selectedColor
                  )
                )}
                alt={product.name}
                className={classNames("rounded-lg")}
              />
            </div>
          </div>

          <div className="mt-8 lg:col-span-5">
            <fetcher.Form replace method="post">
              {/* Color picker */}
              <div>
                <h2 className="text-sm font-medium text-gray-900">Couleur</h2>

                <RadioGroup
                  value={selectedColor}
                  onChange={setSelectedColor}
                  className="mt-2"
                >
                  <RadioGroup.Label className="sr-only">
                    Choisir une couleur
                  </RadioGroup.Label>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color) => (
                      <RadioGroup.Option
                        key={color.id}
                        value={color.id}
                        className={({ active, checked }) =>
                          classNames(
                            "ring-indigo-600",
                            active && checked ? "ring ring-offset-1" : "",
                            !active && checked ? "ring-2" : "",
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none"
                          )
                        }
                      >
                        <RadioGroup.Label as="span" className="sr-only">
                          {color.name}
                        </RadioGroup.Label>
                        <span
                          aria-hidden="true"
                          className={classNames(
                            `bg-[${color.hex}]`,
                            "h-8 w-8 rounded-full border border-black border-opacity-10"
                          )}
                        />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Size picker */}
              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">Taille</h2>
                  {/* <a
                    href="#"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Voir le guide des tailles
                  </a> */}
                </div>

                <RadioGroup
                  name="sizeId"
                  value={selectedSize}
                  onChange={setSelectedSize}
                  className="mt-2"
                >
                  <RadioGroup.Label className="sr-only">
                    Choisir une taille
                  </RadioGroup.Label>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {getColorById(selectedColor).sizes.map((size) => (
                      <RadioGroup.Option
                        key={size.name}
                        value={size.id}
                        className={({ active, checked }) =>
                          classNames(
                            size.amount > 0
                              ? "cursor-pointer focus:outline-none"
                              : "cursor-not-allowed opacity-25",
                            active
                              ? "ring-2 ring-indigo-500 ring-offset-2"
                              : "",
                            checked
                              ? "border-transparent bg-indigo-600 text-white hover:bg-indigo-700"
                              : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
                            "flex items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase sm:flex-1"
                          )
                        }
                        disabled={!size.amount}
                      >
                        <RadioGroup.Label as="span">
                          {size.name}
                        </RadioGroup.Label>
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              <button
                type="submit"
                name="_action"
                value="add"
                className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Ajouter au panier
              </button>
            </fetcher.Form>

            {/* Product details */}
            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Description</h2>

              <div
                className="prose prose-sm mt-4 text-gray-500"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-sm font-medium text-gray-900">
                Tissu &amp; Entretien
              </h2>

              <div className="prose prose-sm mt-4 text-gray-500">
                <ul role="list">
                  {details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Policies */}
            <section aria-labelledby="policies-heading" className="mt-10">
              <h2 id="policies-heading" className="sr-only">
                Nos politiques
              </h2>

              <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {policies.map((policy) => (
                  <div
                    key={policy.name}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center"
                  >
                    <dt>
                      <policy.icon
                        className="mx-auto h-6 w-6 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      <span className="mt-4 text-sm font-medium text-gray-900">
                        {policy.name}
                      </span>
                    </dt>
                    <dd className="mt-1 text-sm text-gray-500">
                      {policy.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        {/* Reviews */}
        <section aria-labelledby="reviews-heading" className="mt-16 sm:mt-24">
          <h2
            id="reviews-heading"
            className="text-lg font-medium text-gray-900"
          >
            Avis récents
          </h2>

          <div className="mt-6 space-y-10 divide-y divide-gray-200 border-t border-b border-gray-200 pb-10">
            {reviews.featured.map((review) => (
              <div
                key={review.id}
                className="pt-10 lg:grid lg:grid-cols-12 lg:gap-x-8"
              >
                <div className="lg:col-span-8 lg:col-start-5 xl:col-span-9 xl:col-start-4 xl:grid xl:grid-cols-3 xl:items-start xl:gap-x-8">
                  <div className="flex items-center xl:col-span-1">
                    <div className="flex items-center">
                      {[0, 1, 2, 3, 4].map((rating) => (
                        <StarIcon
                          key={rating}
                          className={classNames(
                            review.rating > rating
                              ? "text-yellow-400"
                              : "text-gray-200",
                            "h-5 w-5 flex-shrink-0"
                          )}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="ml-3 text-sm text-gray-700">
                      {review.rating}
                      <span className="sr-only"> sur 5 étoiles</span>
                    </p>
                  </div>

                  <div className="mt-4 lg:mt-6 xl:col-span-2 xl:mt-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      {review.title}
                    </h3>

                    <div
                      className="mt-3 space-y-6 text-sm text-gray-500"
                      dangerouslySetInnerHTML={{ __html: review.content }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center text-sm lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:flex-col lg:items-start xl:col-span-3">
                  <p className="font-medium text-gray-900">{review.author}</p>
                  <time
                    dateTime={review.datetime}
                    className="ml-4 border-l border-gray-200 pl-4 text-gray-500 lg:ml-0 lg:mt-2 lg:border-0 lg:pl-0"
                  >
                    {review.date}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related products */}
        <section aria-labelledby="related-heading" className="mt-16 sm:mt-24">
          <h2
            id="related-heading"
            className="text-lg font-medium text-gray-900"
          >
            Ces autres produits pourraient vous intéresser
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {otherProductListItems.map((otherProduct) => (
              <div key={otherProduct.id} className="group relative">
                <div className="min-h-80 aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md group-hover:opacity-75 lg:aspect-none lg:h-80">
                  <img
                    src={getProductImageUrl(otherProduct)}
                    alt={otherProduct.name}
                    className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                  />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700">
                      <a href={"/produits/" + otherProduct.slug}>
                        <span aria-hidden="true" className="absolute inset-0" />
                        {otherProduct.name}
                      </a>
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {otherProduct.price} €
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
