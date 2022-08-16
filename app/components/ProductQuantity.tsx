import { XIcon } from "@heroicons/react/solid";
import { useFetcher, useOutletContext } from "@remix-run/react";
import type { ContextType } from "~/root";

export default function ProductQuantity({ id }: { id?: string }) {
  const { cart } = useOutletContext<ContextType>();
  const fetcher = useFetcher();

  const currentCartItem = cart.find((item) => item.id === id);

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    fetcher.submit(
      event.currentTarget.parentElement?.parentElement as HTMLFormElement,
      { replace: true }
    );
  }

  return (
    <fetcher.Form replace method="post">
      <input type="hidden" name="sizeId" value={id} />
      {currentCartItem ? (
        <div className="mt-8 flex w-full flex-row items-center">
          <label htmlFor={`quantity-${id}`} className="sr-only">
            Quantité, {currentCartItem.color.product.name}
          </label>
          <select
            id={`quantity-${id}`}
            name="quantity"
            className="max-w-full flex-1 rounded-md border border-gray-300 py-1.5 text-center text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
            defaultValue={currentCartItem.amount}
            onChange={handleChange}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
          </select>

          <button
            type="submit"
            name="_action"
            value="remove"
            className="ml-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Supprimer</span>
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="submit"
          name="_action"
          value="add"
          className="mt-8 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-8 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Ajouter au panier
        </button>
      )}
    </fetcher.Form>
  );
}
