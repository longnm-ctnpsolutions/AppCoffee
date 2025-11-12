import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"

export default function UserDetailHeader() {
  return (
    <Card>
    <CardHeader>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle>Người dùng</CardTitle>
          <CardDescription>Giao diện cho quản trị viên quản lý danh tính.</CardDescription>
        </div>
      </div>
    </CardHeader>
  </Card>
  );
}
