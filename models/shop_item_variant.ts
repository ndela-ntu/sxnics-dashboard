export interface IShopItemVariant {
  id: number;
  shop_item_id: number;
  quantity: number;
  image_url: string;
  color: { id: number; name: string; hash_color: string };
  size: { id: number; name: string };
}
