import * as z from "zod"
import type { Application } from "@/features/applications/types/application.types"
import type { DashboardConfig } from "@/shared/types/dashboard.types"

const addApplicationFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a application name." }),
  identifier: z.string().min(1, { message: "Please enter a application identifier." }),
  description: z.string(),
  homepageurl: z.string(),
  logo: z.any().optional(),
})

export const applicationDashboardConfig: DashboardConfig<Application> = {
  entityName: 'application',
  entityNamePlural: 'applications',
  
  formSchema: addApplicationFormSchema,
  
  defaultFormValues: {
    name: "",
    identifier: "",
    description: "",
    homepageurl: "",
    logo: null,
  },
  
  emptyState: {
    title: "No applications found",
    description: "Get started by creating your first application.",
    actionLabel: "Add Application"
  }
}

export { addApplicationFormSchema }
