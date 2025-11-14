"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Printer } from 'lucide-react';

interface PaymentModalProps {
    total: number;
    onClose: () => void;
    onPayment: (shouldPrint: boolean, method: string, received?: string) => void;
}

export const PaymentModal = ({ total, onClose, onPayment }: PaymentModalProps) => {
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
