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
            <TabsTrigger value="details">Chi tiết</TabsTrigger>
            <TabsTrigger value="permissions">Quyền</TabsTrigger>
          </TabsList>
          <div className="flex justify-end mt-2 gap-x-2">
            <Button size="sm" variant="outline">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Hủy kích hoạt
            </Button>
            <Button size="sm" className="bg-[#0f6cbd] text-white hover:bg-[#084c91]">
              <Pencil className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
          <div className="pt-3">
            <TabsContent value="details">
              <div className="space-y-2 p-2">
                <p>ID Máy khách</p>
                <Input className="bg-transparent" placeholder="Nhập tên máy khách" />
                <p>Tên máy khách</p>
                <Input placeholder="Nhập tên máy khách" />
                <p>Định danh</p>
                <Input placeholder="Nhập tên máy khách" />
                <p>Mô tả</p>
                <Input placeholder="Nhập tên máy khách" />
                <p>URL Trang chủ</p>
                <Input placeholder="Nhập tên máy khách" />
                <p>URL Trang chủ</p>
                <div className="flex flex-col items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        Nhấn để tải lên hoặc kéo và thả
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
                      <label htmlFor="dropzone-file">Chọn một tệp</label>
                    </Button>
                    <span className="ml-2 text-sm text-muted-foreground">hoặc Thả tệp vào đây</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="permissions">
              <p>Truy cập và cập nhật tài liệu của bạn.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Card>
  );
}
