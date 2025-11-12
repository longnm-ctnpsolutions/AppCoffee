"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Pencil, RefreshCcw } from "lucide-react"

export default function UserDetailTabs() {
  return (
    <Card className="h-[calc(100vh-150px)] overflow-y-auto">
      <div className="p-6">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
          </TabsList>
          <div className="flex justify-end mt-2 gap-x-2">
            <Button size="sm" variant="outline">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Deactivate
            </Button>
            <Button size="sm" className="bg-[#0f6cbd] text-white hover:bg-[#084c91]">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          <div className="pt-3">
            <TabsContent value="details">
              <div className="space-y-2 p-2">
                <p>Client ID</p>
                <Input className="bg-transparent" placeholder="Enter client name" />
                <p>Client Name</p>
                <Input placeholder="Enter client name" />
                <p>Identifier</p>
                <Input placeholder="Enter client name" />
                <p>Description</p>
                <Input placeholder="Enter client name" />
                <p>Homepage URL</p>
                <Input placeholder="Enter client name" />
                <p>Homepage URL</p>
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        Click to upload or drag and drop
                      </p>
                    </div>
                    <Input 
                      id="dropzone-file" 
                      type="file" 
                      className="hidden" 
                      // onChange={(e) => field.onChange(e.target.files)} 
                    />
                  </label>
                  <div className="flex items-center mt-2">
                    <Button asChild variant="outline" size="sm">
                      <label htmlFor="dropzone-file">Select a file</label>
                    </Button>
                    <span className="ml-2 text-sm text-muted-foreground">or Drop file here</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="permissions">
              <p>Access and update your documents.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
}