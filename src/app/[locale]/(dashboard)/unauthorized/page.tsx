"use client"

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl">Unauthorized</CardTitle>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </CardContent>
      </Card>
    </div>
  )
}
