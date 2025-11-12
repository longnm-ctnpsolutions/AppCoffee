
"use client";

import { Save } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { CardTitle, CardDescription } from "@/shared/components/ui/card";

export function SettingsHeader() {
  return (
    <div className="flex items-start justify-between">
      <div>
        <CardTitle className="text-2xl tracking-tight">Settings</CardTitle>
        <CardDescription>
          Manage authentication and password policies for the system.
        </CardDescription>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
