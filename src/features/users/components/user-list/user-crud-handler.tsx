import { useCrudHandlers } from "@/shared/hooks/use-crud-handler";

export function useUserCrudHandlers(
    addUser: (data: any) => Promise<boolean>,
    removeUser: (id: string) => Promise<boolean>,
    removeMultipleUsers: (ids: string[]) => Promise<boolean>,
    toast: any,
    addUserForm: any,
    setAddUserDialogOpen: (open: boolean) => void
) {
    return useCrudHandlers({
        addItem: addUser,
        removeItem: removeUser,
        removeMultipleItems: removeMultipleUsers,
        toast,
        form: addUserForm,
        setDialogOpen: setAddUserDialogOpen,
        onSuccess: {
            add: (values: { name: string; }) => {
                toast({
                    title: "User added",
                    description: `${values.name} has been added to the user list.`,
                });
            },
        },
    });
}
