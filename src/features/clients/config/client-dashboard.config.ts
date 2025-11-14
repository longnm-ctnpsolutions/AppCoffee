import * as z from "zod"
import type { Client } from "@/features/clients/types/client.types"
import type { DashboardConfig } from "@/shared/types/dashboard.types"

const addClientFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a client name." }),
  identifier: z.string().min(1, { message: "Please enter a client identifier." }),
  description: z.string(),
  homepageurl: z.string(),
  logo: z.any().optional(),
})

export const clientDashboardConfig: DashboardConfig<Client> = {
  entityName: 'client',
  entityNamePlural: 'clients',
  
  formSchema: addClientFormSchema,
  
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

export { addClientFormSchema }
