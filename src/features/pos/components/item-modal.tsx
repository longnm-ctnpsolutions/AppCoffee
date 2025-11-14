"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { X, Plus, Minus } from 'lucide-react';
import { TOPPINGS } from '@/features/pos/lib/data';
import type { MenuItem, Topping } from '@/features/pos/types/pos.types';

interface ItemModalProps {
    item: MenuItem;
    onClose: () => void;
    onAdd: (options: { size: string; toppings: Topping[] }) => void;
}

const SizeSelector = ({ sizes, selectedSize, onSelect }: { sizes: { [key: string]: number }, selectedSize: string, onSelect: (size: string) => void }) => (
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

const ToppingItem = ({ topping, selected, onToggle, onUpdateQuantity }: { topping: Topping, selected: boolean, onToggle: () => void, onUpdateQuantity: (delta: number) => void }) => (
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


export const ItemModal = ({ item, onClose, onAdd }: ItemModalProps) => {
    const defaultSize = Object.keys(item.sizes).includes("M") ? "M" : "S";
    const [size, setSize] = useState(defaultSize);
    const [toppings, setToppings] = useState<Topping[]>([]);

    const toggleTopping = (topping: Topping) => {
        const existing = toppings.find((t) => t.id === topping.id);
        if (existing) {
            setToppings(toppings.filter((t) => t.id !== topping.id));
        } else {
            setToppings([...toppings, { ...topping, quantity: 1 }]);
        }
    };

    const updateToppingQuantity = (toppingId: number, delta: number) => {
        setToppings(
            toppings.map((t) => {
                if (t.id === toppingId) {
                    return { ...t, quantity: Math.max(1, (t.quantity || 1) + delta) };
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
        toppings.reduce((sum, t) => sum + t.price * (t.quantity || 1), 0);

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
                                            topping={selectedTopping || { ...topping, quantity: 1 }}
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
