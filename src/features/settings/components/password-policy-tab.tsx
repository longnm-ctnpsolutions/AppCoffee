
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Separator } from "@/shared/components/ui/separator";
import { KeyRound } from "lucide-react";

export function PasswordPolicyTab() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <KeyRound className="h-6 w-6" />
        <CardTitle className="text-lg">Chính sách mật khẩu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="password-history" className="font-semibold">
            Hạn chế lịch sử mật khẩu
          </Label>
          <Input id="password-history" type="number" defaultValue="3" className="w-24" />
          <p className="text-sm text-muted-foreground">
            Người dùng không thể sử dụng lại 3 mật khẩu cuối cùng
          </p>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="password-expiry" className="font-semibold">
            Hết hạn mật khẩu (ngày)
          </Label>
          <Input id="password-expiry" type="number" defaultValue="90" className="w-24" />
          <p className="text-sm text-muted-foreground">
            Buộc thay đổi mật khẩu sau 90 ngày (trừ tài khoản AD)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
