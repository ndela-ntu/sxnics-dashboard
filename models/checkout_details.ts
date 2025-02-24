export interface IOrderItems {
    id: number;
    total: number;
    quantity: number;
}

export interface ICheckoutDetails {
    id: number;
    created_at: string;
    fullname: string;
    email: string;
    phone: string;
    streetAddress: string;
    suburb: string;
    city: string;
    postalCode: string;
    total: string;
    items: IOrderItems[];
    status: string;
}