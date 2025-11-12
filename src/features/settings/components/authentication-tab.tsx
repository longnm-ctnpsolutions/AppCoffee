
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { LockKeyhole, ShieldCheck } from "lucide-react";

export function AuthenticationTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <ShieldCheck className="h-6 w-6" />
          <CardTitle className="text-lg">MFA Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label htmlFor="mfa-switch" className="font-semibold">Enable MFA</Label>
              <p className="text-sm text-muted-foreground">
                MFA Methods: Authenticator App (TOTP)
              </p>
            </div>
            <Switch id="mfa-switch" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <LockKeyhole className="h-6 w-6" />
          <CardTitle className="text-lg">Login Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-2">
            <Label htmlFor="login-attempts">Max Failed Login Attempts</Label>
            <Input id="login-attempts" type="number" defaultValue="5" className="w-24" />
            <p className="text-sm text-muted-foreground">
              Lock account after this number of failed logins
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
