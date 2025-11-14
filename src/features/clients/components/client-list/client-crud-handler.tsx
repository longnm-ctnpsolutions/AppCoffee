import { useCrudHandlers } from "@/shared/hooks/use-crud-handler";

export function useClientCrudHandlers(
  addClient: (data: any) => Promise<boolean>,
  removeClient: (id: string) => Promise<boolean>, 
  removeMultipleClients: (ids: string[]) => Promise<boolean>,
  toast: any,
  addClientForm: any,
  setAddClientDialogOpen: (open: boolean) => void
) {
  return useCrudHandlers({
    addItem: addClient,
    removeItem: removeClient,
    removeMultipleItems: removeMultipleClients,
    toast,
    form: addClientForm,
    setDialogOpen: setAddClientDialogOpen,
    onSuccess: {
      add: (values: { name: string }) => {
        toast({
          title: "Client added",
          description: `${values.name} has been added to the client list.`,
        });
      },
    },
  });
}