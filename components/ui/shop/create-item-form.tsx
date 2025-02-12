"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ShopItemState, createShopItem } from "@/app/actions";
import { createClient } from "@/utils/supabase/client";
import StyledCheckbox from "../style-checkbox";
import { Loader2 } from "lucide-react";

function SubmitButton({ disabled }: { disabled: boolean }) {
  const status = useFormStatus();

  return (
    <button
      className={`bg-white px-2 py-1 text-black ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      type="submit"
      disabled={disabled || status.pending}
    >
      {status.pending ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        "Add Item"
      )}
    </button>
  );
}

export default function CreateItemForm() {
  const supabase = createClient();

  const [checkedVariants, setCheckedVariants] = useState<
    Record<string, boolean>
  >({});

  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string }[]>([]);
  const [itemTypes, setItemTypes] = useState<
    { id: number; type: string; has_sizes: boolean }[]
  >([]);

  const [selectedItemType, setSelectedItemType] = useState<number | null>(null);

  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ShopItemState, FormData>(
    createShopItem,
    initialState
  );

  useEffect(() => {
    const fetchClothingProps = async () => {
      const { data: sizes } = await supabase.from("size").select("*");
      const { data: colors } = await supabase.from("color").select("*");
      const { data: itemTypes } = await supabase
        .from("shop_item_type")
        .select("*");

      setSizes(sizes || []);
      if (colors) {
        const initialCheckedState = colors.reduce(
          (acc, color) => {
            acc[color.name] = false;
            return acc;
          },
          {} as Record<string, boolean>
        );

        setCheckedVariants(initialCheckedState);
        setColors(colors);
      }
      if (itemTypes && itemTypes.length > 0) {
        setSelectedItemType(itemTypes[0].id);
        setItemTypes(itemTypes);
      }
    };

    fetchClothingProps();
  }, []);

  const handleCheckboxChange = (colorName: string) => {
    setCheckedVariants((prev) => ({
      ...prev,
      [colorName]: !prev[colorName],
    }));
  };

  const atLeastOneColorChecked = Object.values(checkedVariants).some(
    (isChecked) => isChecked
  );

  return (
    <form
      action={dispatch}
      className="flex flex-col items-center justify-center w-full"
    >
      <div className="space-y-4 w-full md:w-1/2">
        <div>
          <label className="block text-sm font-medium text-white-700">
            Item Type
          </label>
          <select
            name="item_type_id"
            className="w-full p-1.5 bg-transparent text-white border border-white"
            required
            onChange={(e) => {
              setSelectedItemType(parseInt(e.target.value));
            }}
            value={selectedItemType?.toString()}
          >
            {itemTypes.map((itemType, index) => (
              <option
                className="bg-white text-black"
                key={index}
                value={itemType.id}
              >
                {itemType.type}
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
          {colors.map((color, index) => (
            <div key={index} className="flex flex-col space-y-5 border-t py-5">
              <div className="flex space-x-3">
                <StyledCheckbox
                  label={color.name}
                  name={`checked_${color.name}`}
                  onChange={(_) => {
                    handleCheckboxChange(color.name);
                  }}
                  checked={checkedVariants[color.name]}
                />
              </div>
              {checkedVariants[color.name] && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm">
                      Product Image ({color.name})
                    </label>
                    <input
                      type="file"
                      name={`image_${color.name}`} // Ensure the name matches the key used in `parseFormData`
                      accept="image/*"
                      className="w-full"
                      required={checkedVariants[color.name]} // Only require the file if the color is checked
                    />
                  </div>
                  {itemTypes.find(
                    (itemType) => itemType.id === selectedItemType
                  )?.has_sizes ? (
                    <div className="space-y-3">
                      {sizes.map((size) => (
                        <div
                          key={size.name}
                          className="flex items-center gap-4"
                        >
                          <label className="w-20">{size.name}</label>
                          <input
                            type="number"
                            name={`quantity_${color.name}_${size.name}`}
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
                        name={`quantity-${color.name}`}
                        min="0"
                        className="p-1.5 bg-transparent text-white border border-white w-full"
                        placeholder="Qty"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <div id="colors-error" aria-live="polite" aria-atomic="true">
            {state.errors?.colors &&
              state.errors.colors.map((error: string, i) => (
                <p key={i} className="text-sm text-red-500">
                  {error}
                </p>
              ))}
          </div>
        </div>
        {state?.message && (
          <div className="w-full text-red-600">{state.message}</div>
        )}
      </div>
      <SubmitButton disabled={!atLeastOneColorChecked} />
    </form>
  );
}
