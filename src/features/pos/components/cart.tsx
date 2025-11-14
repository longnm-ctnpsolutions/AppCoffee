"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Coffee } from 'lucide-react';
import { CartItemCard } from './cart-item-card';
import { PaymentModal } from './payment-modal';
import type { CartItem as CartItemType } from '@/features/pos/types/pos.types';

interface CartProps {
    cart: CartItemType[];
    setCart: React.Dispatch<React.SetStateAction<CartItemType[]>>;
    onClearCart: () => void;
    onPaymentSuccess: (paymentData: any) => void;
}

export const Cart = ({ cart, setCart, onClearCart, onPaymentSuccess }: CartProps) => {
    const [discountType, setDiscountType] = useState<"none" | "percent" | "amount">("none");
    const [discountValue, setDiscountValue] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const updateCartItemQuantity = (id: number, delta: number) => {
        setCart(
            cart.map((item) => {
                if (item.id === id) {
                    return { ...item, quantity: Math.max(1, item.quantity + delta) };
                }
                return item;
            })
        );
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
    }, [cart]);

    const discount = useMemo(() => {
        if (discountType === "percent") {
            return (subtotal * (parseFloat(discountValue) || 0)) / 100;
        }
        if (discountType === "amount") {
            return parseFloat(discountValue) || 0;
        }
        return 0;
    }, [subtotal, discountType, discountValue]);

    const total = useMemo(() => subtotal - discount, [subtotal, discount]);

    const handlePayment = (shouldPrint: boolean, method: string, received?: string) => {
        onPaymentSuccess({
            shouldPrint,
            method,
            received,
            cart: [...cart],
            subtotal: subtotal,
            discount: discount,
            total: total,
        });
        setShowPaymentModal(false);
        setDiscountType("none");
        setDiscountValue("");
    };

    return (
        <>
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
                                <CartItemCard
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
                <div className="border-t bg-white flex-shrink-0">
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
                                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Giảm giá:</span>
                                    <span>-{discount.toLocaleString("vi-VN")}đ</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold">
                                <span className="text-gray-800">Tổng cộng:</span>
                                <span className="text-blue-600">
                                    {total.toLocaleString("vi-VN")}đ
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
            {showPaymentModal && (
                <PaymentModal
                    total={total}
                    onClose={() => setShowPaymentModal(false)}
                    onPayment={handlePayment}
                />
            )}
        </>
    );
};
