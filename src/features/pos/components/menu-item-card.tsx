import { Card, CardContent } from "@/shared/components/ui/card";
import type { MenuItem as MenuItemType } from "@/features/pos/types/pos.types";

interface MenuItemCardProps {
    item: MenuItemType;
    onClick: (item: MenuItemType) => void;
}

export const MenuItemCard = ({ item, onClick }: MenuItemCardProps) => (
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
