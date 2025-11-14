import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "@/features/pos/types/pos.types";

interface CartItemCardProps {
    item: CartItemType;
    onUpdateQuantity: (id: number, delta: number) => void;
    onRemove: (id: number) => void;
}

export const CartItemCard = ({ item, onUpdateQuantity, onRemove }: CartItemCardProps) => (
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
