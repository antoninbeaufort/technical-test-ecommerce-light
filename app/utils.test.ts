import { validateEmail, validateCardExpiration } from "./utils";

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false);
  expect(validateEmail(null)).toBe(false);
  expect(validateEmail("")).toBe(false);
  expect(validateEmail("not-an-email")).toBe(false);
  expect(validateEmail("n@")).toBe(false);
});

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true);
});

test("validateCardExpiration return false for non-valid card expiration", () => {
  expect(validateCardExpiration(undefined)).toBe(false);
  expect(validateCardExpiration(null)).toBe(false);
  expect(validateCardExpiration(false)).toBe(false);
  expect(validateCardExpiration(true)).toBe(false);
  expect(validateCardExpiration({})).toBe(false);
  expect(validateCardExpiration([])).toBe(false);
  expect(validateCardExpiration("05/22")).toBe(false);
  expect(validateCardExpiration("01/21")).toBe(false);
})

test("validateCardExpiration return true for valid card expiration", () => {
  expect(validateCardExpiration("05/24")).toBe(true);
  expect(validateCardExpiration("12/22")).toBe(true);
})