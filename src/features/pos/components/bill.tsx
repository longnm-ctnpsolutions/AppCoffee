import type { CartItem } from "@/features/pos/types/pos.types";

interface BillProps {
    cart: CartItem[];
    subtotal: number;
    discount: number;
    total: number;
    method: string;
    received?: string;
}

export const Bill = ({ cart, subtotal, discount, total, method, received }: BillProps) => {
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
                                                {(t.price * (t.quantity || 1)).toLocaleString("vi-VN")}đ
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
