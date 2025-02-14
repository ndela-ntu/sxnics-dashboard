"use client";

import Image from "next/image";
import { DeleteItemButton } from "./delete-item-button";
import { IShopItem } from "@/models/shop-item";
import EditButton from "../edit-button";
import placeholderImage from "../../../app/placeholder.webp";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function ShopItem({ item }: { item: IShopItem }) {
  const supabase = createClient();

  const [itemIndex, setItemIndex] = useState<number>(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [hashColors, setHashColors] = useState<string[]>([]);

  useEffect(() => {
    let imageUrls: string[] = [];
    let hashColors: string[] = [];

    const fetchVariants = async () => {
      const { data: shopItemVariant, error } = await supabase
        .from("shop_item_variant")
        .select(`*, color(id, name, hash_color)`)
        .eq("shop_item_id", item.id);

      if (error) {
        console.log(error.message);
      }

      shopItemVariant?.forEach((variant) => {
        if (!imageUrls.includes(variant.image_url)) {
          imageUrls.push(variant.image_url);
          hashColors.push(variant.color.hash_color);
        }
      });

      setImageUrls(imageUrls);
      setHashColors(hashColors);
    };

    fetchVariants();
  }, []);

  return (
    <div className="border shadow-md overflow-hidden p-1 md:p-2.5">
      <div className="relative aspect-square">
        <Image
          src={imageUrls[itemIndex]}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="flex items-center pt-2 space-x-2">
        {hashColors.map((color, index) => (
          <span
            onClick={() => {
              setItemIndex(index);
            }}
            key={index}
            className={`border-2 w-6 h-6 bg-[${color}]`}
          />
        ))}
      </div>
      <div className="flex w-full flex-col">
        <label className="text-xl font-bold">{item.name}</label>
        <p>{item.description}</p>
        <span className="font-bold">R{item.price}</span>
      </div>
      <div className="flex items-center justify-center pt-5 space-x-5">
        <EditButton href={`/dashboard/shop/edit-item/${item.id}`} />
        <DeleteItemButton id={item.id} />
      </div>
    </div>
  );
}
