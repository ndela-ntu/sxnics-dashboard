"use client";

import { ShopItemState, editShopItem } from "@/app/actions";
import { IShopItem } from "@/models/shop-item";
import { IShopItemVariant } from "@/models/shop_item_variant";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useFormState } from "react-dom";
import StyledCheckbox from "../style-checkbox";
import SquareResponsiveImage from "../square-responsive-image";
import placeholder from "../../../app/placeholder.webp";

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
        "Update Item"
      )}
    </button>
  );
}

export default function EditClothingItem({
  item,
  variants,
}: {
  item: IShopItem;
  variants: IShopItemVariant[];
}) {
  const supabase = createClient();

  const [checkedVariants, setCheckedVariants] = useState<
    Record<string, boolean>
  >({});
  const [initialCheckedState, setInitialCheckedState] = useState<
    Record<string, boolean>
  >({});

  const formRef = useRef<HTMLFormElement>(null);
  const [sizes, setSizes] = useState<{ id: number; name: string }[]>([]);
  const [colors, setColors] = useState<{ id: number; name: string }[]>([]);
  const [itemTypes, setItemTypes] = useState<
    { id: number; type: string; has_sizes: boolean }[]
  >([]);
  const [selectedItemType, setSelectedItemType] = useState<number | null>(null);

  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState<ShopItemState, FormData>(
    editShopItem,
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
            acc[color.name] = variants.some(
              (variant) => variant.color.id === color.id
            );
            return acc;
          },
          {} as Record<string, boolean>
        );

        setCheckedVariants(initialCheckedState);
        setInitialCheckedState(initialCheckedState);
        setColors(colors);
      }
      if (itemTypes && itemTypes.length > 0) {
        setSelectedItemType(item.shop_item_type.id);
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

  const isCurrentSelectedItem = item.shop_item_type.id === selectedItemType;

  // Reset checked variants when item type changes
  useEffect(() => {
    if (!isCurrentSelectedItem) {
      setCheckedVariants({});
    } else {
      setCheckedVariants(initialCheckedState);
    }
  }, [isCurrentSelectedItem]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        const keysWithChangedState = Object.entries(initialCheckedState)
          .filter(
            ([key, value]) => value === true && checkedVariants[key] !== true
          )
          .map(([key]) => key);

        if (isCurrentSelectedItem) {
          const uncheckedColorsIds = colors
            .filter((color) => keysWithChangedState.includes(color.name))
            .map((color) => color.id);

          formData.append(
            "uncheckedColorsIds",
            JSON.stringify({ uncheckedColorsIds })
          );
        }

        const form = formRef.current;

        if (!form) return;

        colors.forEach((color) => {
          const colorName = color.name;
          if (formData.get(`checked_${colorName}`)) {
            const fileInput = form.querySelector<HTMLInputElement>(
              `input[name="image_${colorName}"]`
            );

            if (!fileInput) return;

            const file = fileInput.files?.[0];
            const existingUrl = fileInput.dataset.existingUrl;

            if (!file && existingUrl) {
              formData.set(`image_${colorName}`, existingUrl);
            }
          }
        });

        console.log("-------------------");
        formData.forEach((value, key) => {
          console.log(`${key}:`, value);
        });

        dispatch(formData);
      }}
      className="transition-all duration-300 flex flex-col items-center justify-center space-y-2 w-full"
    >
      <div className="space-y-4 w-full md:w-1/2">
        <input type="hidden" name="shop_item_id" value={item.id} />
        <input
          type="hidden"
          name="itemTypeChanged"
          value={(!isCurrentSelectedItem).toString()}
        />

        {/* Item Type Select */}
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
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white-700"
          >
            Name
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
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-white-700"
          >
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Description"
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
        <div>
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
            placeholder="Price"
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
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Inventory Variants</h3>
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex flex-col space-y-5 border-t py-5"
            >
              <div className="flex space-x-3">
                <StyledCheckbox
                  initChecked={
                    isCurrentSelectedItem &&
                    variants.some((variant) => variant.color.id === color.id)
                  }
                  label={color.name}
                  name={`checked_${color.name}`}
                  onChange={() => handleCheckboxChange(color.name)}
                  checked={checkedVariants[color.name] || false}
                />
              </div>

              {/* Show details only when checked and relevant */}
              {checkedVariants[color.name] && (
                <div>
                  <div className="mb-4">
                    {isCurrentSelectedItem &&
                    variants.some(
                      (variant) => variant.color.id === color.id
                    ) ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Product Image ({color.name})
                        </span>
                        <SquareResponsiveImage
                          src={
                            variants.find(
                              (variant) => variant.color.id === color.id
                            )?.image_url || placeholder
                          }
                          alt="Image of product"
                          size="sm"
                        />
                      </div>
                    ) : (
                      <label className="block text-sm">
                        Product Image ({color.name})
                      </label>
                    )}
                    <input
                      type="file"
                      name={`image_${color.name}`}
                      accept="image/*"
                      className="w-full"
                      required={
                        checkedVariants[color.name] &&
                        !variants.some(
                          (variant) => variant.color.id === color.id
                        )
                      }
                      data-existing-url={
                        variants.find(
                          (variant) => variant.color.id === color.id
                        )?.image_url || ""
                      }
                    />
                  </div>

                  {/* Quantity inputs */}
                  {itemTypes.find(
                    (itemType) => itemType.id === selectedItemType
                  )?.has_sizes ? (
                    <div className="space-y-3">
                      {sizes
                        .filter((size) => size.id !== 0)
                        .map((size) => (
                          <div
                            key={size.id}
                            className="flex items-center gap-4"
                          >
                            <label className="w-20">{size.name}</label>
                            <input
                              type="number"
                              name={`quantity_${color.name}_${size.name}`}
                              min="0"
                              className="p-1.5 bg-transparent text-white border border-white w-full"
                              placeholder="Qty"
                              defaultValue={
                                isCurrentSelectedItem &&
                                variants.some(
                                  (variant) => variant.color.id === color.id
                                )
                                  ? (variants.find(
                                      (variant) => variant.size.id === size.id
                                    )?.quantity ?? 0)
                                  : undefined
                              }
                            />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="w-20">Quantity</label>
                      <input
                        type="number"
                        name={`quantity_${color.name}`}
                        min="0"
                        className="p-1.5 bg-transparent text-white border border-white w-full"
                        placeholder="Qty"
                        defaultValue={
                          isCurrentSelectedItem &&
                          variants.some(
                            (variant) => variant.color.id === color.id
                          )
                            ? (variants.find(
                                (variant) => variant.color.id === color.id
                              )?.quantity ?? 0)
                            : undefined
                        }
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
          {state?.message && (
            <div className="w-full text-red-600">{state.message}</div>
          )}
        </div>
        <SubmitButton disabled={!atLeastOneColorChecked} />
      </div>
    </form>
  );
}
