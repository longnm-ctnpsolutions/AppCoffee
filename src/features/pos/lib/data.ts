import type { Category, MenuItem, Topping } from "@/features/pos/types/pos.types";

export const CATEGORIES: Category[] = [
  { id: "all", name: "Tất cả", icon: "🍽️" },
  { id: "coffee", name: "Cà phê", icon: "☕" },
  { id: "milktea", name: "Trà sữa", icon: "🧋" },
  { id: "smoothie", name: "Sinh tố", icon: "🥤" },
  { id: "tea", name: "Trà", icon: "🍵" },
  { id: "juice", name: "Nước ép", icon: "🧃" },
  { id: "snack", name: "Đồ ăn vặt", icon: "🍟" },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "Cà phê sữa đá",
    category: "coffee",
    basePrice: 25000,
    sizes: { S: 25000, M: 30000, L: 35000 },
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    name: "Cà phê đen đá",
    category: "coffee",
    basePrice: 20000,
    sizes: { S: 20000, M: 25000, L: 30000 },
    image:
      "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Bạc xỉu",
    category: "coffee",
    basePrice: 28000,
    sizes: { S: 28000, M: 33000, L: 38000 },
    image:
      "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop",
  },
  {
    id: 4,
    name: "Cappuccino",
    category: "coffee",
    basePrice: 35000,
    sizes: { S: 35000, M: 40000, L: 45000 },
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
  },
  {
    id: 5,
    name: "Latte",
    category: "coffee",
    basePrice: 38000,
    sizes: { S: 38000, M: 43000, L: 48000 },
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Trà sữa trân châu",
    category: "milktea",
    basePrice: 30000,
    sizes: { S: 30000, M: 35000, L: 40000 },
    image:
      "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=400&h=300&fit=crop",
  },
  {
    id: 7,
    name: "Trà sữa socola",
    category: "milktea",
    basePrice: 32000,
    sizes: { S: 32000, M: 37000, L: 42000 },
    image:
      "https://images.unsplash.com/photo-1578899952107-9d90f85d36f0?w=400&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Trà sữa matcha",
    category: "milktea",
    basePrice: 35000,
    sizes: { S: 35000, M: 40000, L: 45000 },
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&h=300&fit=crop",
  },
  {
    id: 9,
    name: "Sinh tố bơ",
    category: "smoothie",
    basePrice: 35000,
    sizes: { S: 35000, M: 40000, L: 45000 },
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&h=300&fit=crop",
  },
  {
    id: 10,
    name: "Sinh tố dâu",
    category: "smoothie",
    basePrice: 32000,
    sizes: { S: 32000, M: 37000, L: 42000 },
    image:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop",
  },
  {
    id: 11,
    name: "Trà đào cam sả",
    category: "tea",
    basePrice: 30000,
    sizes: { S: 30000, M: 35000, L: 40000 },
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=300&fit=crop",
  },
  {
    id: 12,
    name: "Trà vải",
    category: "tea",
    basePrice: 28000,
    sizes: { S: 28000, M: 33000, L: 38000 },
    image:
      "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=400&h=300&fit=crop",
  },
  {
    id: 13,
    name: "Nước ép cam",
    category: "juice",
    basePrice: 25000,
    sizes: { S: 25000, M: 30000, L: 35000 },
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop",
  },
  {
    id: 14,
    name: "Nước ép dứa",
    category: "juice",
    basePrice: 27000,
    sizes: { S: 27000, M: 32000, L: 37000 },
    image:
      "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=300&fit=crop",
  },
  {
    id: 15,
    name: "Bánh mì nướng bơ",
    category: "snack",
    basePrice: 20000,
    sizes: { S: 20000 },
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
  },
  {
    id: 16,
    name: "Gà rán",
    category: "snack",
    basePrice: 35000,
    sizes: { S: 35000 },
    image:
      "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop",
  },
];

export const TOPPINGS: Topping[] = [
  { id: 1, name: "Trân châu đen", price: 5000 },
  { id: 2, name: "Trân châu trắng", price: 5000 },
  { id: 3, name: "Thạch dừa", price: 5000 },
  { id: 4, name: "Pudding", price: 7000 },
  { id: 5, name: "Kem cheese", price: 10000 },
  { id: 6, name: "Shot espresso", price: 10000 },
];
