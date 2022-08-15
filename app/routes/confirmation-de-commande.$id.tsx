import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Cart } from "~/models/cart.server";
import { getOrder } from "~/models/order.server";
import { numberFormatOptions } from "~/utils";

type LoaderData = {
  order: NonNullable<Awaited<ReturnType<typeof getOrder>>>;
};
export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.id, "id not found");

  const order = await getOrder({ id: params.id });
  if (!order) {
    throw new Response("Not found", { status: 404 });
  }

  return json<LoaderData>({
    order,
  });
};

export default function OrderConfirmation() {
  const { order } = useLoaderData() as LoaderData;

  return (
    <>
      <main className="relative lg:min-h-full">
        <div className="h-80 overflow-hidden lg:absolute lg:h-full lg:w-1/2 lg:pr-4 xl:pr-12">
          <img
            src="https://tailwindui.com/img/ecommerce-images/confirmation-page-06-hero.jpg"
            alt="Étagères avec de la décoration et des vêtements"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div>
          <div className="mx-auto max-w-2xl py-16 px-4 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-32 xl:gap-x-24">
            <div className="lg:col-start-2">
              <h1 className="text-sm font-medium text-indigo-600">
                Paiement réussi
              </h1>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl sm:tracking-tight">
                Merci de votre commande
              </p>
              <p className="mt-2 text-base text-gray-500">
                Nous apprécions votre commande, nous sommes en train de la
                traiter. Alors veuillez patienter et nous vous enverrons une
                confirmation très bientôt !
              </p>

              <dl className="mt-16 text-sm font-medium">
                <dt className="text-gray-900">Numéro de suivi</dt>
                <dd className="mt-2 text-indigo-600">51547878755545848512</dd>
              </dl>

              <ul
                role="list"
                className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500"
              >
                {(order.line_items as Cart).map((size) => (
                  <li key={size.id} className="flex space-x-6 py-6">
                    <img
                      src={`/produits/${
                        size.color.slug ?? size.color.product.slug
                      }.jpg`}
                      alt={size.color.product.name}
                      className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                    />
                    <div className="flex-auto space-y-1">
                      <h3 className="text-gray-900">
                        <a href={"/produits/" + size.color.product.slug}>
                          {size.color.product.name}
                        </a>
                      </h3>
                      <p>{size.color.name}</p>
                      <p>{size.name}</p>
                      <p>x{size.amount}</p>
                    </div>
                    <p className="flex-none font-medium text-gray-900">
                      {size.color.product.price.toLocaleString(
                        "fr-FR",
                        numberFormatOptions
                      )}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                <div className="flex justify-between">
                  <dt>Sous-total</dt>
                  <dd className="text-gray-900">
                    {order.amount_subtotal.toLocaleString(
                      "fr-FR",
                      numberFormatOptions
                    )}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt>Livraison</dt>
                  <dd className="text-gray-900">
                    {order.total_details_amount_shipping.toLocaleString(
                      "fr-FR",
                      numberFormatOptions
                    )}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt>TVA</dt>
                  <dd className="text-gray-900">
                    {order.total_details_amount_tax.toLocaleString(
                      "fr-FR",
                      numberFormatOptions
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">
                    {order.amount_total.toLocaleString(
                      "fr-FR",
                      numberFormatOptions
                    )}
                  </dd>
                </div>
              </dl>

              <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
                <div>
                  <dt className="font-medium text-gray-900">
                    Adresse de livraison
                  </dt>
                  <dd className="mt-2">
                    <address className="not-italic">
                      <span className="block">
                        {order.firstName} {order.lastName}
                      </span>
                      <span className="block">{order.address}</span>
                      <span className="block">
                        {order.postalCode} {order.city}
                      </span>
                    </address>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">
                    Informations de paiement
                  </dt>
                  <dd className="mt-2 space-y-2 sm:flex sm:space-y-0 sm:space-x-4">
                    <div className="flex-none">
                      <svg
                        aria-hidden="true"
                        width={36}
                        height={24}
                        viewBox="0 0 36 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-auto"
                      >
                        <rect width={36} height={24} rx={4} fill="#224DBA" />
                        <path
                          d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                          fill="#fff"
                        />
                      </svg>
                      <p className="sr-only">Visa</p>
                    </div>
                    <div className="flex-auto">
                      <p className="text-gray-900">
                        Terminant en {order.cbLastFourNumbers}
                      </p>
                      <p>Expiration {order.cbExpirationDate}</p>
                    </div>
                  </dd>
                </div>
              </dl>

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <a
                  href="/"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Continuer le shopping<span aria-hidden="true"> &rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
