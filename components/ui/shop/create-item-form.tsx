"use client";

import { ShopItemState, createShopItem } from "@/app/actions";
import { useState } from "react";
import { useFormState } from "react-dom";

export default function CreateItemForm() {
  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ShopItemState, FormData>(
    createShopItem,
    initialState
  );

  return (
    <form
      className="flex flex-col items-center justify-center space-y-2 w-full"
      action={dispatch}
    >
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-white-700"
        >
          Name
        </label>
        <input
          className="p-1.5 bg-transparent text-white border border-white w-full"
          name="name"
          type="text"
          placeholder="Item Name"
          required
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
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-white-700"
        >
          Description
        </label>
        <textarea
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="description"
          placeholder="Description"
          required
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.description &&
            state.errors.description.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="price"
          className="block text-sm font-medium text-white-700"
        >
          Price
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="price"
          type="number"
          step="0.01"
          placeholder="Price"
          required
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
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-white-700"
        >
          Quantity
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="quantity"
          type="number"
          placeholder="Quantity"
          required
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
      <div className="mb-4 md:w-1/2">
        <label
          htmlFor="image"
          className="block text-sm font-medium text-white-700"
        >
          Image
        </label>
        <input
          className="w-full p-1.5 bg-transparent text-white border border-white"
          name="image"
          type="file"
          accept="image/*"
          required
        />
        <div id="price-error" aria-live="polite" aria-atomic="true">
          {state.errors?.image &&
            state.errors.image.map((error: string, i) => (
              <p key={i} className="text-sm text-red-500">
                {error}
              </p>
            ))}
        </div>
      </div>
      <button className="bg-white px-2 py-1 text-black" type="submit">
        Add Item
      </button>
    </form>
  );
}
