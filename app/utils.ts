import { useMatches } from "@remix-run/react";
import { useMemo } from "react";
import type { getProductBySlug, getProductListItems } from "./models/product.server";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@");
}

export function validateCardNumber(cardNumber: unknown): cardNumber is string {
  return typeof cardNumber === "string" && cardNumber.length > 9 && cardNumber.length < 20;
}

export function validateCardExpiration(cardExpiration: unknown): cardExpiration is string {
  if (!(typeof cardExpiration === "string")) return false;
  const matchs = cardExpiration.match(/(?<month>[0-9]{2})\/(?<year>[0-9]{2})/);
  if (!matchs) return false;
  if (!matchs.groups) return false;
  if (!matchs.groups.month || !matchs.groups.year) return false;
  const month = parseInt(matchs.groups.month, 10);
  const year = parseInt(matchs.groups.year, 10);
  if (!(month < 0 && month > 12 && year < 0 && year > 99)) return false;
  const currentYear = Number(new Date().getFullYear().toString().slice(-2));
  if (year < currentYear) return false;
  if (year === currentYear) {
    const currentMonth = Number(new Date().getMonth() + 1);
    if (month < currentMonth) return false;
  };
  return true;
}

export function validateCVC(cvc: unknown): cvc is string {
  return typeof cvc === "string" && cvc.length > 2 && cvc.length < 5;
}

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const getProductImageUrl = (
  product: Awaited<ReturnType<typeof getProductListItems>>[number] | NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>,
  index = 0
) => {
  const slug = product.colors[index].slug ?? product.slug;
  return `/produits/${slug}.jpg`;
};

export const numberFormatOptions = {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};