import Image from "next/image";
import { DeleteItemButton } from "./delete-item-button";
import { IShopItem } from "@/models/shop-item";
import EditButton from "../edit-button";
import placeholderImage from '../../../app/placeholder.webp'

export default function ShopItem({ item }: { item: IShopItem }) {
  return (
    <div className="border shadow-md overflow-hidden p-1 md:p-2.5">
      <div className="relative aspect-square">
        <Image
          src={placeholderImage}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
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
