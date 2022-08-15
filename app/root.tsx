import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
// import { getUser } from "./session.server";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { getCart } from "./models/cart.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Technical test e-commerce light",
  viewport: "width=device-width,initial-scale=1",
});

type LoaderData = {
  cart: Awaited<ReturnType<typeof getCart>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  return json<LoaderData>({
    cart: await getCart(request),
  });
};

export type ContextType = LoaderData;

export default function App() {
  const { cart } = useLoaderData() as LoaderData;
  const cartCount = cart.reduce((acc, item) => acc + item.amount, 0);
  const context = { cart };
  return (
    <html lang="fr">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Navbar cartCount={cartCount} />
        <Outlet context={context} />
        <Footer />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
