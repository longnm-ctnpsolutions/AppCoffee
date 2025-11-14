import { useCrudHandlers } from "@/shared/hooks/use-crud-handler";

export function useRoleCrudHandlers(
  addRole: (data: any) => Promise<boolean>,
  removeRole: (id: string) => Promise<boolean>, 
  removeMultipleRoles: (ids: string[]) => Promise<boolean>,
  toast: any,
  addRoleForm: any,
  setAddRoleDialogOpen: (open: boolean) => void
) {
  return useCrudHandlers({
    addItem: addRole,
    removeItem: removeRole,
    removeMultipleItems: removeMultipleRoles,
    toast,
    form: addRoleForm,
    setDialogOpen: setAddRoleDialogOpen,
    onSuccess: {
      add: (values: { name: string }) => {
        toast({
          title: "Role added",
          description: `${values.name} has been added to the role list.`,
        });
      },
    },
  });
}