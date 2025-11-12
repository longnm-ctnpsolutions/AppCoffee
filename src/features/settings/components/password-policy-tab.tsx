
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
        <CardTitle className="text-lg">Password Policy</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="password-history" className="font-semibold">
            Password History Restriction
          </Label>
          <Input id="password-history" type="number" defaultValue="3" className="w-24" />
          <p className="text-sm text-muted-foreground">
            User cannot reuse the last 3 passwords
          </p>
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="password-expiry" className="font-semibold">
            Password Expiry (days)
          </Label>
          <Input id="password-expiry" type="number" defaultValue="90" className="w-24" />
          <p className="text-sm text-muted-foreground">
            Force password change after 90 days (except AD accounts)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
