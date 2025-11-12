
import { SettingsHeader } from "@/features/settings/components/settings-header";
import { AuthenticationTab } from "@/features/settings/components/authentication-tab";
import { PasswordPolicyTab } from "@/features/settings/components/password-policy-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

export default function SettingsPage() {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-1">
        <Tabs defaultValue="authentication" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <SettingsHeader />
              <Separator />
              <div>
                <TabsList className="bg-transparent border-b rounded-none p-0 w-full justify-start -mb-px">
                  <TabsTrigger value="authentication" className="tab-trigger">
                    Authentication
                  </TabsTrigger>
                  <TabsTrigger value="password" className="tab-trigger">
                    Password Policy
                  </TabsTrigger>
                </TabsList>
                
                {/* Tab content is now inside the card */}
                <div className="pt-6 border-t">
                  <TabsContent value="authentication" className="mt-0">
                    <AuthenticationTab />
                  </TabsContent>
                  <TabsContent value="password" className="mt-0">
                    <PasswordPolicyTab />
                  </TabsContent>
                </div>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
