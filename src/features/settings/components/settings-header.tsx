
"use client";

import { Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CardTitle, CardDescription } from "@/shared/components/ui/card";

export function SettingsHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <CardTitle className="text-2xl tracking-tight">Cài đặt</CardTitle>
        <CardDescription>
          Quản lý xác thực và chính sách mật khẩu cho hệ thống.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" type="button">
          Hủy
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Lưu
        </Button>
      </div>
    </div>
  );
}
