"use client";

import { ShopItemState, editShopItem } from "@/app/actions";
import { IShopItem } from "@/models/shop-item";
import Image from "next/image";
import { useFormState } from "react-dom";

export default function EditClothingItem({ item }: { item: IShopItem }) {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ShopItemState, FormData>(
    editShopItem,
    initialState
  );

  return (
    <form
      action={dispatch}
      className="flex flex-col items-center justify-center space-y-2 w-full"
    >
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="currentImageUrl" value={item.imageUrl} />
      <div className="mb-4 w-full md:w-1/2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-white-700"
        >
          Name Hello
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={item.name}
          required
          className="p-1.5 bg-transparent text-white border border-white w-full"
        />
        <div id="name-error" aria-live="polite" aria-atomic="true">
          {state.errors?.name &&
            state.errors.name.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-white-700"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={item.description}
          required
          className="p-1.5 bg-transparent text-white border border-white w-full"
        ></textarea>
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.description &&
            state.errors.description.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label
          htmlFor="price"
          className="block text-sm font-medium text-white-700"
        >
          Price
        </label>
        <input
          type="number"
          id="price"
          name="price"
          defaultValue={item.price}
          required
          step="0.01"
          min="0"
          className="p-1.5 bg-transparent text-white border border-white w-full"
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.price &&
            state.errors.price.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-white-700"
        >
          Quantity
        </label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          defaultValue={item.quantity}
          required
          min="0"
          className="p-1.5 bg-transparent text-white border border-white w-full"
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.quantity &&
            state.errors.quantity.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <label
          htmlFor="image"
          className="block text-sm font-medium text-white-700"
        >
          Image
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          className="p-1.5 bg-transparent text-white border border-white w-full"
        />
        <p className="mt-2 text-sm text-white-500 italic">
          *Leave empty to keep the current image
        </p>
      </div>
      <div className="mb-4 w-full md:w-1/2">
        <p className="block text-sm font-medium text-white-700">
          Current Image
        </p>
        <div className="mt-2 relative h-48 w-48">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
      </div>
      <button className="bg-white px-2 py-1 text-black" type="submit">
        Update Item
      </button>
    </form>
  );
}
