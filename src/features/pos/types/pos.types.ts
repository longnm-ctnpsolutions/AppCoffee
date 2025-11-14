export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface MenuItem {
    id: number;
    name: string;
    category: string;
    basePrice: number;
    sizes: { [key: string]: number };
    image: string;
}

export interface Topping {
    id: number;
    name: string;
    price: number;
    quantity?: number;
}

export interface CartItem {
    id: number;
    itemId: number;
    name: string;
    size: string;
    price: number;
    toppings: Topping[];
    toppingsCost: number;
    totalPrice: number;
    quantity: number;
}
