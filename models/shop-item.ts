export interface IShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  shop_item_type: {id: number; type: string; has_sizes: boolean;}
}
