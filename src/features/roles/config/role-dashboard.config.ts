import * as z from "zod"
import type { Role } from "@/features/roles/types/role.types"
import type { DashboardConfig } from "@/shared/types/dashboard.types"

const addRoleFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter a role name." }),
  identifier: z.string().min(1, { message: "Please enter a role identifier." }),
  description: z.string(),
  homepageurl: z.string(),
  logo: z.any().optional(),
})

export const roleDashboardConfig: DashboardConfig<Role> = {
  entityName: 'role',
  entityNamePlural: 'roles',
  
  formSchema: addRoleFormSchema,
  
  defaultFormValues: {
    name: "",
    identifier: "",
    description: "",
    homepageurl: "",
    logo: null,
  },
  
  emptyState: {
    title: "No roles found",
    description: "Get started by creating your first role.",
    actionLabel: "Add Role"
  }
}

export { addRoleFormSchema }
