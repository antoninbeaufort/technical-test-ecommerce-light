import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { RadioGroup, Switch } from "@headlessui/react";
import {
  CheckCircleIcon,
  TrashIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import {
  Form,
  Link,
  useActionData,
  useOutletContext,
  useTransition,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  classNames,
  validateCardExpiration,
  validateCardNumber,
  validateCVC,
  validateEmail,
} from "~/utils";
import type { ContextType } from "~/root";
import { numberFormatOptions } from "~/utils";
import { createOrder } from "~/models/order.server";
import { getCart, setCart } from "~/models/cart.server";
import { getSize } from "~/models/size.server";
import { prisma } from "~/db.server";
import { SearchIcon, ShoppingCartIcon } from "@heroicons/react/outline";

const deliveryMethods = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 jours ouvrés",
    price: 5,
  },
  {
    id: 2,
    title: "Express",
    turnaround: "2–5 jours ouvrés",
    price: 16,
  },
];

type ActionData =
  | {
      fieldErrors: {
        email: null | string;
        firstName: null | string;
        lastName: null | string;
        address: null | string;
        postalCode: null | string;
        city: null | string;
        country: null | string;
        phone: null | string;
        cardNumber: null | string;
        nameOnCard: null | string;
        expirationDate: null | string;
        cvc: null | string;
      };
      formError: string | null;
    }
  | undefined;
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  const email = formData.get("email-address");
  const simulateError = formData.get("simulate-error");
  const firstName = formData.get("first-name");
  const lastName = formData.get("last-name");
  const company = formData.get("company");
  const address = formData.get("address");
  const apartment = formData.get("apartment");
  const postalCode = formData.get("postal-code");
  const city = formData.get("city");
  const country = formData.get("country");
  const phone = formData.get("phone");
  const deliveryMethod = formData.get("delivery-method[title]");
  const deliveryMethodPrice = formData.get("delivery-method[price]");
  const cardNumber = formData.get("card-number");
  const nameOnCard = formData.get("name-on-card");
  const expirationDate = formData.get("expiration-date");
  const cvc = formData.get("cvc");

  // validate types
  const errors: ActionData = {
    fieldErrors: {
      email: validateEmail(email)
        ? null
        : "Veuillez entrer une adresse email valide.",
      firstName: firstName ? null : "Veuillez entrer un prénom.",
      lastName: lastName ? null : "Veuillez entrer un nom.",
      address: address ? null : "Veuillez entrer une adresse.",
      postalCode: postalCode ? null : "Veuillez entrer un code postal.",
      city: city ? null : "Veuillez entrer une ville.",
      country: country ? null : "Veuillez entrer un pays.",
      phone: phone ? null : "Veuillez entrer un numéro de téléphone.",
      cardNumber: validateCardNumber(cardNumber)
        ? null
        : "Veuillez entrer un numéro de carte bancaire valide.",
      nameOnCard: nameOnCard ? null : "Veuillez entrer un nom.",
      expirationDate: validateCardExpiration(expirationDate)
        ? null
        : "Veuillez entrer une date d'expiration de carte bancaire valide.",
      cvc: validateCVC(cvc) ? null : "Veuillez entrer un CVC.",
    },
    formError: null,
  };
  const hasErrors = Object.values(errors.fieldErrors).some(
    (errorMessage) => errorMessage
  );
  const cookieResetCart = await setCart(request, []);
  const onMismatch = (message: string) => {
    errors.formError = message;
    return json<ActionData>(errors, {
      headers: {
        "Set-Cookie": cookieResetCart,
      },
    });
  };
  if (simulateError) {
    return onMismatch("Erreur simulée");
  }
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof email === "string", "email must be a string");
  invariant(typeof firstName === "string", "firstName must be a string");
  invariant(typeof lastName === "string", "lastName must be a string");

  invariant(typeof address === "string", "address must be a string");

  invariant(typeof postalCode === "string", "postalCode must be a string");
  invariant(typeof city === "string", "city must be a string");
  invariant(typeof country === "string", "country must be a string");
  invariant(typeof phone === "string", "phone must be a string");
  invariant(typeof cardNumber === "string", "cardNumber must be a string");
  invariant(
    typeof expirationDate === "string",
    "expirationDate must be a string"
  );
  invariant(
    typeof deliveryMethod === "string",
    "deliveryMethod must be a string"
  );
  invariant(
    typeof deliveryMethodPrice === "string",
    "deliveryMethodPrice must be a string"
  );
  invariant(
    Number(deliveryMethodPrice) ===
      deliveryMethods.find((dm) => dm.title === deliveryMethod)?.price,
    "deliveryMethodPrice must match server price"
  );

  const cart = await getCart(request);

  // create an order using cart if cart matching server data
  // correct price, amount under stock, etc.
  for (const size of cart) {
    const serverSize = await getSize({ id: size.id });
    if (!serverSize) return onMismatch("Le produit n'existe pas.");
    if (size.color.product.price !== serverSize.color.product.price)
      return onMismatch("Le prix ne correspond pas");
    if (size.amount > serverSize.amount) return onMismatch("Stock insuffisant");
  }

  // remove items from stock
  for (const size of cart) {
    await prisma.size.update({
      where: { id: size.id },
      data: {
        amount: {
          decrement: size.amount,
        },
      },
    });
  }

  const subTotal = cart.reduce(
    (acc, item) => acc + item.amount * item.color.product.price,
    0
  );

  const shippingPrice = Number(deliveryMethodPrice);
  const total = subTotal + shippingPrice;
  const TVA = total * 0.2;

  const order = await createOrder({
    email,
    firstName,
    lastName,
    ...(typeof company === "string" && company && { company }),
    ...(typeof apartment === "string" && apartment && { apartment }),
    address,
    postalCode,
    city,
    country,
    phone,
    shipping_method: deliveryMethod,
    total_details_amount_shipping: shippingPrice,
    total_details_amount_tax: TVA,
    amount_subtotal: subTotal,
    amount_total: total,
    status: "PROCESSING",
    line_items: cart,
    cbLastFourNumbers: cardNumber.slice(-4),
    cbExpirationDate: expirationDate,
  });

  // clear cart and redirect
  return redirect(`/confirmation-de-commande/${order.id}`, {
    headers: {
      "Set-Cookie": cookieResetCart,
    },
  });
};

export default function Checkout() {
  const [enabled, setEnabled] = useState(false);
  const errors = useActionData() as ActionData;
  const transition = useTransition();
  const isProcessing = Boolean(transition.submission);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    deliveryMethods[0]
  );
  const { cart } = useOutletContext<ContextType>();
  const cartCount = cart.reduce((acc, item) => acc + item.amount, 0);
  const subTotal = cart.reduce(
    (acc, item) => acc + item.amount * item.color.product.price,
    0
  );

  const total = subTotal + selectedDeliveryMethod.price;
  const TVA = total * 0.2;

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Procéder au paiement</h2>

        {errors?.formError ? (
          <>
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon
                    className="h-5 w-5 text-red-400"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Une erreur est survenue lors de la commande
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{errors.formError}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Votre panier est vide
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencer par ajouter des produits à votre panier
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <SearchIcon
                    className="-ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Découvrez notre gamme
                </Link>
              </div>
            </div>
          </>
        ) : (
          <Form
            method="post"
            className="cypress-checkout-form lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
          >
            <div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Informations de contact
                </h2>

                <div className="mt-4">
                  <label
                    htmlFor="email-address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Adresse e-mail{" "}
                    {errors?.fieldErrors.email ? (
                      <em className="text-red-600">
                        {errors.fieldErrors.email}
                      </em>
                    ) : null}
                  </label>
                  <div className="mt-1">
                    <input
                      required
                      type="email"
                      id="email-address"
                      name="email-address"
                      autoComplete="email"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">
                  Informations de livraison
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label
                      htmlFor="first-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Prénom
                      {errors?.fieldErrors.firstName ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.firstName}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        id="first-name"
                        name="first-name"
                        autoComplete="given-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="last-name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom
                      {errors?.fieldErrors.lastName ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.lastName}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        id="last-name"
                        name="last-name"
                        autoComplete="family-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Entreprise
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="company"
                        id="company"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Adresse
                      {errors?.fieldErrors.address ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.address}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        name="address"
                        id="address"
                        autoComplete="street-address"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="apartment"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Résidence, bâtiment, appartement, etc...
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="apartment"
                        id="apartment"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="postal-code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Code postal
                      {errors?.fieldErrors.postalCode ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.postalCode}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        name="postal-code"
                        id="postal-code"
                        autoComplete="postal-code"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Ville
                      {errors?.fieldErrors.city ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.city}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        name="city"
                        id="city"
                        autoComplete="address-level2"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Pays
                      {errors?.fieldErrors.country ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.country}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <select
                        required
                        id="country"
                        name="country"
                        autoComplete="country-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option>France</option>
                        <option>Espagne</option>
                        <option>Allemagne</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Téléphone
                      {errors?.fieldErrors.phone ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.phone}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        name="phone"
                        id="phone"
                        autoComplete="tel"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10 border-t border-gray-200 pt-10">
                <RadioGroup
                  name="delivery-method"
                  value={selectedDeliveryMethod}
                  onChange={setSelectedDeliveryMethod}
                >
                  <RadioGroup.Label className="text-lg font-medium text-gray-900">
                    Méthode de livraison
                  </RadioGroup.Label>

                  <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                    {deliveryMethods.map((deliveryMethod) => (
                      <RadioGroup.Option
                        key={deliveryMethod.id}
                        value={deliveryMethod}
                        className={({ checked, active }) =>
                          classNames(
                            checked ? "border-transparent" : "border-gray-300",
                            active ? "ring-2 ring-indigo-500" : "",
                            "relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                          )
                        }
                      >
                        {({ checked, active }) => (
                          <>
                            <span className="flex flex-1">
                              <span className="flex flex-col">
                                <RadioGroup.Label
                                  as="span"
                                  className="block text-sm font-medium text-gray-900"
                                >
                                  {deliveryMethod.title}
                                </RadioGroup.Label>
                                <RadioGroup.Description
                                  as="span"
                                  className="mt-1 flex items-center text-sm text-gray-500"
                                >
                                  {deliveryMethod.turnaround}
                                </RadioGroup.Description>
                                <RadioGroup.Description
                                  as="span"
                                  className="mt-6 text-sm font-medium text-gray-900"
                                >
                                  {deliveryMethod.price.toLocaleString(
                                    "fr-FR",
                                    numberFormatOptions
                                  )}
                                </RadioGroup.Description>
                              </span>
                            </span>
                            {checked ? (
                              <CheckCircleIcon
                                className="h-5 w-5 text-indigo-600"
                                aria-hidden="true"
                              />
                            ) : null}
                            <span
                              className={classNames(
                                active ? "border" : "border-2",
                                checked
                                  ? "border-indigo-500"
                                  : "border-transparent",
                                "pointer-events-none absolute -inset-px rounded-lg"
                              )}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Payment */}
              <div className="mt-10 border-t border-gray-200 pt-10">
                <h2 className="text-lg font-medium text-gray-900">Paiement</h2>

                <div className="mt-6 grid grid-cols-4 gap-y-6 gap-x-4">
                  <div className="col-span-4">
                    <label
                      htmlFor="card-number"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Numéro de carte
                      {errors?.fieldErrors.cardNumber ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.cardNumber}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        id="card-number"
                        name="card-number"
                        autoComplete="cc-number"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="col-span-4">
                    <label
                      htmlFor="name-on-card"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nom
                      {errors?.fieldErrors.nameOnCard ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.nameOnCard}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        id="name-on-card"
                        name="name-on-card"
                        autoComplete="cc-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="col-span-3">
                    <label
                      htmlFor="expiration-date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date d'expiration (MM/AA)
                      {errors?.fieldErrors.expirationDate ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.expirationDate}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        name="expiration-date"
                        id="expiration-date"
                        autoComplete="cc-exp"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cvc"
                      className="block text-sm font-medium text-gray-700"
                    >
                      CVC
                      {errors?.fieldErrors.cvc ? (
                        <em className="text-red-600">
                          {errors.fieldErrors.cvc}
                        </em>
                      ) : null}
                    </label>
                    <div className="mt-1">
                      <input
                        required
                        type="text"
                        name="cvc"
                        id="cvc"
                        autoComplete="csc"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900">
                Récapitulatif de la commande
              </h2>

              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h3 className="sr-only">Produits dans votre panier</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  {cart.map((size) => (
                    <li key={size.id} className="flex py-6 px-4 sm:px-6">
                      <div className="flex-shrink-0">
                        <img
                          src={`/produits/${
                            size.color.slug ?? size.color.product.slug
                          }.jpg`}
                          alt={size.color.product.name}
                          className="w-20 rounded-md"
                        />
                      </div>

                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm">
                              <a
                                href={"/produits/" + size.color.product.slug}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {size.color.product.name}
                              </a>
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {size.color.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {size.name}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              x{size.amount}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-1 items-end justify-between pt-2">
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {size.color.product.price.toLocaleString(
                              "fr-FR",
                              numberFormatOptions
                            )}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <dl className="space-y-6 border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Sous-total</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {subTotal.toLocaleString("fr-FR", numberFormatOptions)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">Livraison</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selectedDeliveryMethod.price.toLocaleString(
                        "fr-FR",
                        numberFormatOptions
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm">TVA</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {TVA.toLocaleString("fr-FR", numberFormatOptions)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base font-medium">Total</dt>
                    <dd className="text-base font-medium text-gray-900">
                      {total.toLocaleString("fr-FR", numberFormatOptions)}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <Switch.Group as="div" className="mb-4 flex items-center">
                    <Switch
                      name="simulate-error"
                      checked={enabled}
                      onChange={setEnabled}
                      className={classNames(
                        enabled ? "bg-indigo-600" : "bg-gray-200",
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      )}
                    >
                      <span className="sr-only">Simuler une erreur</span>
                      <span
                        aria-hidden="true"
                        className={classNames(
                          enabled ? "translate-x-5" : "translate-x-0",
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        )}
                      />
                    </Switch>
                    <Switch.Label as="span" className="ml-3">
                      <span className="text-sm font-medium text-gray-900">
                        Simuler une erreur
                      </span>
                    </Switch.Label>
                  </Switch.Group>
                  <button
                    type="submit"
                    disabled={!cartCount || isProcessing}
                    className="w-full rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 disabled:bg-indigo-200"
                  >
                    {isProcessing
                      ? "Confirmation en cours..."
                      : "Confirmer la commande"}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        )}
      </div>
    </div>
  );
}
