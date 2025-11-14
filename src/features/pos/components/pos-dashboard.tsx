import React, { useState } from "react";
import {
  X,
  Plus,
  Minus,
  Trash2,
  Printer,
  Coffee,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/conponents/ui/card";
import { Button } from "@/conponents/ui/button";
import { Input } from "@/conponents/ui/input";
import { ScrollArea } from "@/conponents/ui/scroll-area";

// ==================== DATA ====================
const CATEGORIES = [
  { id: "all", name: "Tất cả", icon: "🍽️" },
  { id: "coffee", name: "Cà phê", icon: "☕" },
  { id: "milktea", name: "Trà sữa", icon: "🧋" },
  { id: "smoothie", name: "Sinh tố", icon: "🥤" },
  { id: "tea", name: "Trà", icon: "🍵" },
  { id: "juice", name: "Nước ép", icon: "🧃" },
  { id: "snack", name: "Đồ ăn vặt", icon: "🍟" },
];

const MENU_ITEMS = [
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

const TOPPINGS = [
  { id: 1, name: "Trân châu đen", price: 5000 },
  { id: 2, name: "Trân châu trắng", price: 5000 },
  { id: 3, name: "Thạch dừa", price: 5000 },
  { id: 4, name: "Pudding", price: 7000 },
  { id: 5, name: "Kem cheese", price: 10000 },
  { id: 6, name: "Shot espresso", price: 10000 },
];

// ==================== MENU ITEM COMPONENT ====================
const MenuItem = ({ item, onClick }) => (
  <Card
    className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 border-blue-100"
    onClick={() => onClick(item)}
  >
    <CardContent className="p-4">
      <div className="text-4xl text-center mb-2">{item.image}</div>
      <h3 className="font-semibold text-sm mb-1 text-center text-gray-800">
        {item.name}
      </h3>
      <p className="text-blue-600 font-bold text-center">
        {item.basePrice.toLocaleString("vi-VN")}đ
      </p>
    </CardContent>
  </Card>
);

// ==================== CART ITEM COMPONENT ====================
const CartItem = ({ item, onUpdateQuantity, onRemove }) => (
  <Card className="border-blue-100">
    <CardContent className="p-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-gray-800">{item.name}</h4>
          <p className="text-xs text-gray-500">Size: {item.size}</p>
          {item.toppings.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {item.toppings.map((t) => (
                <div key={t.id}>
                  • {t.name} x{t.quantity}
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.id, -1)}
            className="h-7 w-7 p-0 border-blue-200 hover:bg-blue-50"
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="font-semibold w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateQuantity(item.id, 1)}
            className="h-7 w-7 p-0 border-blue-200 hover:bg-blue-50"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        <span className="font-bold text-blue-600">
          {(item.totalPrice * item.quantity).toLocaleString("vi-VN")}đ
        </span>
      </div>
    </CardContent>
  </Card>
);

// ==================== SIZE SELECTOR COMPONENT ====================
const SizeSelector = ({ sizes, selectedSize, onSelect }) => (
  <div className="mb-4">
    <label className="font-semibold mb-2 block text-gray-800">Chọn size</label>
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(sizes).map(([sizeKey, price]) => {
        const isActive = selectedSize === sizeKey;
        return (
          <Button
            key={sizeKey}
            variant={isActive ? "default" : "outline"}
            onClick={() => onSelect(sizeKey)}
            className={
              isActive
                ? "bg-blue-600 hover:bg-blue-700 flex flex-col h-auto py-3"
                : "border-blue-200 hover:bg-blue-50 flex flex-col h-auto py-3"
            }
          >
            <span className="font-bold">{sizeKey}</span>
            <span className="text-xs">{price.toLocaleString("vi-VN")}đ</span>
          </Button>
        );
      })}
    </div>
  </div>
);

// ==================== TOPPING ITEM COMPONENT ====================
const ToppingItem = ({ topping, selected, onToggle, onUpdateQuantity }) => (
  <div className="flex items-center justify-between p-2 border border-blue-100 rounded hover:bg-blue-50 transition-colors">
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="w-4 h-4 accent-blue-600"
      />
      <div>
        <div className="text-sm font-medium text-gray-800">{topping.name}</div>
        <div className="text-xs text-gray-500">
          +{topping.price.toLocaleString("vi-VN")}đ
        </div>
      </div>
    </div>
    {selected && (
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(-1)}
          className="h-6 w-6 p-0 border-blue-200"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-6 text-center text-sm font-semibold">
          {topping.quantity}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateQuantity(1)}
          className="h-6 w-6 p-0 border-blue-200"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    )}
  </div>
);

// ==================== ITEM MODAL COMPONENT ====================
const ItemModal = ({ item, onClose, onAdd }) => {
  const defaultSize = Object.keys(item.sizes).includes("M") ? "M" : "S";
  const [size, setSize] = useState(defaultSize);
  const [toppings, setToppings] = useState([]);

  const toggleTopping = (topping) => {
    const existing = toppings.find((t) => t.id === topping.id);
    if (existing) {
      setToppings(toppings.filter((t) => t.id !== topping.id));
    } else {
      setToppings([...toppings, { ...topping, quantity: 1 }]);
    }
  };

  const updateToppingQuantity = (toppingId, delta) => {
    setToppings(
      toppings.map((t) => {
        if (t.id === toppingId) {
          return { ...t, quantity: Math.max(1, t.quantity + delta) };
        }
        return t;
      })
    );
  };

  const handleAdd = () => {
    onAdd({ size, toppings });
    onClose();
  };

  const totalPrice =
    item.sizes[size] +
    toppings.reduce((sum, t) => sum + t.price * t.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border-blue-200">
        <CardHeader className="flex flex-row items-start justify-between border-b">
          <div>
            <CardTitle className="text-xl text-gray-800">{item.name}</CardTitle>
            <p className="text-2xl mt-2">{item.image}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-blue-50"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <ScrollArea className="flex-1">
          <CardContent className="p-4">
            <SizeSelector
              sizes={item.sizes}
              selectedSize={size}
              onSelect={setSize}
            />
            <div className="mb-4">
              <label className="font-semibold mb-2 block text-gray-800">
                Topping (tùy chọn)
              </label>
              <div className="space-y-2">
                {TOPPINGS.map((topping) => {
                  const selectedTopping = toppings.find(
                    (t) => t.id === topping.id
                  );
                  return (
                    <ToppingItem
                      key={topping.id}
                      topping={selectedTopping || topping}
                      selected={!!selectedTopping}
                      onToggle={() => toggleTopping(topping)}
                      onUpdateQuantity={(delta) =>
                        updateToppingQuantity(topping.id, delta)
                      }
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={handleAdd}
          >
            Thêm vào đơn - {totalPrice.toLocaleString("vi-VN")}đ
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ==================== PAYMENT MODAL COMPONENT ====================
const PaymentModal = ({ total, onClose, onPayment }) => {
  const [method, setMethod] = useState("cash");
  const [received, setReceived] = useState("");

  const change = parseFloat(received) - total;
  const canPay = method === "transfer" || (received && change >= 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-blue-200">
        <CardHeader className="border-b">
          <CardTitle className="text-gray-800">Thanh toán</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <label className="font-semibold mb-2 block text-gray-800">
                Hình thức thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={method === "cash" ? "default" : "outline"}
                  onClick={() => setMethod("cash")}
                  className={
                    method === "cash"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-200 hover:bg-blue-50"
                  }
                >
                  💵 Tiền mặt
                </Button>
                <Button
                  variant={method === "transfer" ? "default" : "outline"}
                  onClick={() => setMethod("transfer")}
                  className={
                    method === "transfer"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-200 hover:bg-blue-50"
                  }
                >
                  💳 Chuyển khoản
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-100">
              <div className="flex justify-between">
                <span className="text-gray-700">Tổng tiền:</span>
                <span className="font-bold text-blue-600">
                  {total.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            {method === "cash" && (
              <div>
                <label className="font-semibold mb-2 block text-gray-800">
                  Tiền khách đưa
                </label>
                <Input
                  type="number"
                  placeholder="Nhập số tiền"
                  value={received}
                  onChange={(e) => setReceived(e.target.value)}
                  className="text-lg border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
                {received && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>Tiền thừa:</span>
                      <span>{change.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => onPayment(true, method, received)}
                disabled={!canPay}
              >
                <Printer className="w-4 h-4 mr-2" />
                Thanh toán & In bill
              </Button>
              <Button
                className="w-full border-blue-200 hover:bg-blue-50"
                variant="outline"
                onClick={() => onPayment(false, method, received)}
                disabled={!canPay}
              >
                Thanh toán không in
              </Button>
              <Button
                className="w-full hover:bg-gray-100"
                variant="ghost"
                onClick={onClose}
              >
                Hủy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== BILL COMPONENT ====================
const Bill = ({ cart, subtotal, discount, total, method, received }) => {
  const change =
    method === "cash" && received ? parseFloat(received) - total : 0;

  return (
    <div className="hidden print:block">
      <div className="p-8 max-w-sm mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">QUÁN CAFE TAKE AWAY</h1>
          <p className="text-sm">123 Đường ABC, Quận 1, TP.HCM</p>
          <p className="text-sm">SĐT: 0123 456 789</p>
          <p className="text-sm border-t border-b border-dashed my-2 py-1">
            {new Date().toLocaleString("vi-VN")}
          </p>
        </div>

        <div className="mb-4">
          {cart.map((item, idx) => (
            <div key={idx} className="mb-3 text-sm">
              <div className="flex justify-between font-semibold">
                <span>
                  {item.name} ({item.size})
                </span>
                <span>
                  {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                </span>
              </div>
              {item.toppings.length > 0 && (
                <div className="ml-4 text-xs text-gray-600">
                  {item.toppings.map((t, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        + {t.name} x{t.quantity}
                      </span>
                      <span>
                        {(t.price * t.quantity).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-gray-500">
                SL: {item.quantity} x {item.totalPrice.toLocaleString("vi-VN")}đ
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{subtotal.toLocaleString("vi-VN")}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>TỔNG CỘNG:</span>
            <span>{total.toLocaleString("vi-VN")}đ</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Thanh toán:</span>
            <span>{method === "cash" ? "Tiền mặt" : "Chuyển khoản"}</span>
          </div>
          {method === "cash" && received && (
            <div>
              <div className="flex justify-between text-sm">
                <span>Tiền khách đưa:</span>
                <span>{parseFloat(received).toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tiền thừa:</span>
                <span>{change.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm">
          <p>Cảm ơn quý khách!</p>
          <p>Hẹn gặp lại!</p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP COMPONENT ====================
const CafePOSSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [discountType, setDiscountType] = useState("none");
  const [discountValue, setDiscountValue] = useState("");
  const [lastPayment, setLastPayment] = useState(null);
  const [showCart, setShowCart] = useState(false);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowItemModal(true);
  };

  const handleAddToCart = (options) => {
    const price = selectedItem.sizes[options.size];
    const toppingsCost = options.toppings.reduce(
      (sum, t) => sum + t.price * t.quantity,
      0
    );
    const cartItem = {
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

  const updateCartItemQuantity = (id, delta) => {
    setCart(
      cart.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percent") {
      return (subtotal * (parseFloat(discountValue) || 0)) / 100;
    }
    if (discountType === "amount") {
      return parseFloat(discountValue) || 0;
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const handlePayment = (shouldPrint, method, received) => {
    const paymentData = {
      method: method,
      received: received,
      cart: [...cart],
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      total: calculateTotal(),
    };
    setLastPayment(paymentData);

    if (shouldPrint) {
      setTimeout(() => window.print(), 100);
    }

    setCart([]);
    setShowPaymentModal(false);
    setDiscountType("none");
    setDiscountValue("");
    setShowCart(false);
  };

  const cartPanelClass = showCart
    ? "fixed inset-0 z-40 md:relative md:z-0 md:flex md:w-96 lg:w-[28rem] bg-white border-l flex-col shadow-lg"
    : "hidden md:flex md:w-96 lg:w-[28rem] bg-white border-l flex-col shadow-lg";

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b p-4 shadow-sm">
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
                <MenuItem key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className={cartPanelClass}>
        <div className="p-4 border-b bg-white flex items-center justify-between">
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

        <ScrollArea className="flex-1">
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                <Coffee className="w-16 h-16 mx-auto mb-2 opacity-20" />
                <p>Chưa có món nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateCartItemQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {cart.length > 0 && (
          <div className="border-t bg-white">
            <div className="p-4">
              <label className="text-sm font-semibold mb-2 block text-gray-800">
                Giảm giá
              </label>
              <div className="flex gap-2 mb-2">
                <Button
                  variant={discountType === "none" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDiscountType("none");
                    setDiscountValue("");
                  }}
                  className={
                    discountType === "none"
                      ? "flex-1 bg-blue-600 hover:bg-blue-700"
                      : "flex-1 border-blue-200 hover:bg-blue-50"
                  }
                >
                  Không
                </Button>
                <Button
                  variant={discountType === "percent" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDiscountType("percent")}
                  className={
                    discountType === "percent"
                      ? "flex-1 bg-blue-600 hover:bg-blue-700"
                      : "flex-1 border-blue-200 hover:bg-blue-50"
                  }
                >
                  %
                </Button>
                <Button
                  variant={discountType === "amount" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDiscountType("amount")}
                  className={
                    discountType === "amount"
                      ? "flex-1 bg-blue-600 hover:bg-blue-700"
                      : "flex-1 border-blue-200 hover:bg-blue-50"
                  }
                >
                  VNĐ
                </Button>
              </div>
              {discountType !== "none" && (
                <Input
                  type="number"
                  placeholder={
                    discountType === "percent" ? "Phần trăm" : "Số tiền"
                  }
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              )}
            </div>
            <div className="p-4 border-t bg-blue-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Tạm tính:</span>
                  <span>{calculateSubtotal().toLocaleString("vi-VN")}đ</span>
                </div>
                {calculateDiscount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{calculateDiscount().toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-800">Tổng cộng:</span>
                  <span className="text-blue-600">
                    {calculateTotal().toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowPaymentModal(true)}
              >
                Thanh toán
              </Button>
            </div>
          </div>
        )}
      </div>

      {showItemModal && selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setShowItemModal(false)}
          onAdd={handleAddToCart}
        />
      )}

      {showPaymentModal && (
        <PaymentModal
          total={calculateTotal()}
          onClose={() => setShowPaymentModal(false)}
          onPayment={handlePayment}
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
