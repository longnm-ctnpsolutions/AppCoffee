import * as z from "zod";
import type { DashboardConfig } from "@/shared/types/dashboard.types";
import { User } from "../types/user.types";

const addUserFormSchema = z.object({
    email: z.string().min(1, { message: "Please enter a User name." }),
});

export const userDashboardConfig: DashboardConfig<User> = {
    entityName: "User",
    entityNamePlural: "Users",

    formSchema: addUserFormSchema,

    defaultFormValues: {
        email: "",
    },

    emptyState: {
        title: "No Users found",
        description: "Get started by creating your first User.",
        actionLabel: "Add User",
    },
};

export { addUserFormSchema };
