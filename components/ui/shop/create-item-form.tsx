"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { ShopItemState, createShopItem } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import StyledCheckbox from "../style-checkbox";

const ITEM_TYPES = ["SHIRT", "HOODIE", "CAP"] as const;
type ItemType = (typeof ITEM_TYPES)[number];

export default function CreateItemForm() {
  const supabase = createClient();

  const [checkedVariants, setCheckedVariants] = useState<{
    blackChecked: boolean;
    whiteChecked: boolean;
  }>({ blackChecked: false, whiteChecked: false });

  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);

  const initialState = { message: null, errors: {} };
  const [state, formAction] = useFormState<ShopItemState, FormData>(
    createShopItem,
    initialState
  );
  const [selectedType, setSelectedType] = useState<ItemType>("SHIRT");

  const showSizes = selectedType === "SHIRT" || selectedType === "HOODIE";

  useEffect(() => {
    const fetchSizes = async () => {
      const { data: sizes } = await supabase.from('size').select("*");
      setSizes(sizes || []);
    }

    fetchSizes();
  }, [])

  return (
    <form
      action={formAction}
      className="flex flex-col items-center justify-center w-full"
    >
      <div className="space-y-4 w-full md:w-1/2">
        <div>
          <label className="block text-sm font-medium text-white-700">
            Item Type
          </label>
          <select
            name="type"
            className="w-full p-1.5 bg-transparent text-white border border-white"
            required
            onChange={(e) => setSelectedType(e.target.value as ItemType)}
            value={selectedType}
          >
            {ITEM_TYPES.map((type) => (
              <option className="bg-white text-black" key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Item Name"
            className="p-1.5 bg-transparent text-white border border-white w-full"
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

        <div>
          <label className="block text-sm font-medium text-white-700">
            Description
          </label>
          <textarea
            placeholder="Description"
            name="description"
            className="w-full p-1.5 bg-transparent text-white border border-white"
            rows={3}
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

        <div>
          <label className="block text-sm font-medium text-white-700">
            Price
          </label>
          <input
            type="number"
            name="price"
            step="0.01"
            min="0"
            placeholder="Price"
            className="p-1.5 bg-transparent text-white border border-white w-full"
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
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Inventory Variants</h3>
          <div className="flex flex-col space-y-3">
            {/*Black Inventory*/}
            <div>
              <div className="flex space-x-3">
                <StyledCheckbox
                  label="Black"
                  onChange={(value) =>
                    setCheckedVariants((prev) => ({
                      ...prev,
                      blackChecked: value,
                    }))
                  }
                />
              </div>
              {checkedVariants.blackChecked && (
                <div>
                  {showSizes ? (
                    <div className="space-y-3">
                      {sizes.map((size) => (
                        <div
                          key={size.name}
                          className="flex items-center gap-4"
                        >
                          <label className="w-20">{size.name}</label>
                          <input
                            type="number"
                            name={`quantity-BLACK-${size.name}`}
                            min="0"
                            className="p-1.5 bg-transparent text-white border border-white w-full"
                            placeholder="Qty"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="w-20">Quantity</label>
                      <input
                        type="number"
                        name={`quantity-BLACK`}
                        min="0"
                        className="p-1.5 bg-transparent text-white border border-white w-full"
                        placeholder="Qty"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/*White Inventory*/}
            <div>
              <div className="flex space-x-3">
                <StyledCheckbox
                  label="White"
                  onChange={(value) =>
                    setCheckedVariants((prev) => ({
                      ...prev,
                      whiteChecked: value,
                    }))
                  }
                />
              </div>
              {checkedVariants.whiteChecked && (
                <div>
                  {showSizes ? (
                    <div className="space-y-3">
                      {sizes.map((size) => (
                        <div
                          key={size.name}
                          className="flex items-center gap-4"
                        >
                          <label className="w-20">{size.name}</label>
                          <input
                            type="number"
                            name={`quantity-WHITE-${size.name}`}
                            min="0"
                            className="p-1.5 bg-transparent text-white border border-white w-full"
                            placeholder="Qty"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="w-20">Quantity</label>
                      <input
                        type="number"
                        name={`quantity-WHITE`}
                        min="0"
                        className="p-1.5 bg-transparent text-white border border-white w-full"
                        placeholder="Qty"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <div className="space-y-4">
            {colors.map((color, index) => (
              <fieldset key={index} className="border p-4 rounded-md">
                <legend className="font-medium px-2">{color.name}</legend>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-white-700">
                    Product Image ({color.name})
                  </label>
                  <input
                    type="file"
                    name={`image-${color.name}`}
                    accept="image/*"
                    className="w-full"
                    required
                  />
                </div>

                {showSizes ? (
                  <div className="space-y-3">
                    {sizes.map((size, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <label className="w-20">{size.name}</label>
                        <input
                          type="number"
                          name={`quantity-${color.name}-${size.name}`}
                          min="0"
                          className="p-1.5 bg-transparent text-white border border-white w-full"
                          placeholder="Qty"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <label className="w-20">Quantity</label>
                    <input
                      type="number"
                      name={`quantity-${color}`}
                      min="0"
                      className="p-1.5 bg-transparent text-white border border-white w-full"
                      placeholder="Qty"
                    />
                  </div>
                )}
              </fieldset>
            ))}
          </div>*/}
      </div>
      {state?.message && <div className="text-green-600">{state.message}</div>}
      <button className="bg-white px-2 py-1 text-black" type="submit">
        Add Item
      </button>
    </form>
  );
}
