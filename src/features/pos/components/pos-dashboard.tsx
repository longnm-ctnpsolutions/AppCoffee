"use client";

import React, { useState, useMemo } from "react";
import { Coffee, Search, ShoppingCart, X } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Button } from "@/shared/components/ui/button";

import { CATEGORIES, MENU_ITEMS } from "@/features/pos/lib/data";
import type { MenuItem as MenuItemType, CartItem as CartItemType } from "@/features/pos/types/pos.types";

import { MenuItemCard } from "./menu-item-card";
import { Cart } from "./cart";
import { ItemModal } from "./item-modal";
import { Bill } from "./bill";

const CafePOSSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItemType | null>(null);
  const [lastPayment, setLastPayment] = useState<{
    cart: CartItemType[];
    subtotal: number;
    discount: number;
    total: number;
    method: string;
    received?: string;
  } | null>(null);
  const [showCart, setShowCart] = useState(false);

  const filteredItems = useMemo(() => MENU_ITEMS.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  }), [selectedCategory, searchQuery]);

  const handleItemClick = (item: MenuItemType) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAddToCart = (options: { size: string, toppings: any[] }) => {
    if (!selectedItem) return;
    const price = selectedItem.sizes[options.size as keyof typeof selectedItem.sizes];
    const toppingsCost = options.toppings.reduce(
      (sum, t) => sum + t.price * t.quantity,
      0
    );
    const cartItem: CartItemType = {
      id: Date.now(),
      itemId: selectedItem.id,
      name: selectedItem.name,
      size: options.size,
      price: price,
      toppings: options.toppings,
      toppingsCost: toppingsCost,
      totalPrice: price + toppingsCost,
      quantity: 1,
    };
    setCart([...cart, cartItem]);
  };

  const handleClearCart = () => {
    setCart([]);
  }

  const handlePaymentSuccess = (paymentData: any) => {
    setLastPayment(paymentData);
    if (paymentData.shouldPrint) {
        setTimeout(() => window.print(), 100);
    }
    setCart([]);
    setShowCart(false);
  }

  const cartPanelClass = showCart
    ? "fixed inset-0 z-40 md:relative md:z-0 md:flex md:w-96 lg:w-[28rem] bg-white border-l flex flex-col shadow-lg"
    : "hidden md:flex md:w-96 lg:w-[28rem] bg-white border-l flex-col shadow-lg";

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b p-4 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              ☕ Quán Cafe Take Away
            </h1>
            <Button
              variant="outline"
              size="sm"
              className="md:hidden border-blue-200"
              onClick={() => setShowCart(!showCart)}
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Tìm kiếm món..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const btnClass = isActive
                  ? "bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  : "border-blue-200 hover:bg-blue-50 whitespace-nowrap";
                return (
                  <Button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    variant={isActive ? "default" : "outline"}
                    className={btnClass}
                  >
                    <span className="mr-1">{cat.icon}</span>
                    {cat.name}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className={cartPanelClass}>
        <div className="p-4 border-b bg-white flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">Đơn hàng</h2>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setShowCart(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <Cart 
          cart={cart}
          setCart={setCart}
          onClearCart={handleClearCart}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>

      {showItemModal && selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setShowItemModal(false)}
          onAdd={handleAddToCart}
        />
      )}

      {lastPayment && (
        <Bill
          cart={lastPayment.cart}
          subtotal={lastPayment.subtotal}
          discount={lastPayment.discount}
          total={lastPayment.total}
          method={lastPayment.method}
          received={lastPayment.received}
        />
      )}
    </div>
  );
};

export default CafePOSSystem;
