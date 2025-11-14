import { Suspense } from 'react'
import { CreateNewPasswordForm } from "@/features/auth/components/create-new-password"

export default function CreateNewPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateNewPasswordForm />
    </Suspense>
  )
}