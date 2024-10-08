import Image from "next/image";
import EditItemButton from "./edit-item-button";
import { DeleteItemButton } from "./delete-item-button";
import { IShopItem } from "@/models/shop-item";

export default function ShopItem({ item }: { item: IShopItem }) {
  return (
    <div className="border rounded-lg shadow-md overflow-hidden p-2.5">
      <div className="relative aspect-square border">
        <Image
          src={item.imageUrl}
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
        <EditItemButton id={item.id} />
        <DeleteItemButton id={item.id} />
      </div>
    </div>
  );
}
