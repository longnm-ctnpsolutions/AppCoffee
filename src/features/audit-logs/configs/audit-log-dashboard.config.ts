import * as z from "zod"
import type { AuditLog } from "@/features/audit-logs/types/audit-log.types"
import type { DashboardConfig } from "@/shared/types/dashboard.types"

const addAuditLogFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a audit-log name." }),
  identifier: z.string().min(1, { message: "Please enter a audit-log identifier." }),
  description: z.string(),
  homepageurl: z.string(),
  logo: z.any().optional(),
})

export const auditLogDashboardConfig: DashboardConfig<AuditLog> = {
  entityName: 'auditLog',
  entityNamePlural: 'auditLogs',
  
  formSchema: addAuditLogFormSchema,
  
  defaultFormValues: {
    name: "",
    identifier: "",
    description: "",
    homepageurl: "",
    logo: null,
  },
  
  emptyState: {
    title: "No clients found",
    description: "Get started by creating your first client.",
    actionLabel: "Add Client"
  }
}

export { addAuditLogFormSchema }
