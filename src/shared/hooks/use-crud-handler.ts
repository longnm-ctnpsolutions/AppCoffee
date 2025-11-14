import * as React from "react"

interface UseCrudHandlersProps<T> {
    addItem: (data: any) => Promise<boolean>
    removeItem: (id: string) => Promise<boolean>
    removeMultipleItems: (ids: string[]) => Promise<boolean>
    toast: any
    form?: any
    setDialogOpen?: (open: boolean) => void
    onSuccess?: {
      add?: (data: T) => void
      delete?: (id: string) => void
      deleteMultiple?: (ids: string[]) => void
    }
  }
  
  export function useCrudHandlers<T>({
    addItem,
    removeItem,
    removeMultipleItems,
    toast,
    form,
    setDialogOpen,
    onSuccess
  }: UseCrudHandlersProps<T>) {
    
    const handleAdd = React.useCallback(async (values: any) => {
      const success = await addItem(values)
      
      if (success) {
        setDialogOpen?.(false)
        form?.reset()
        toast({
          title: "Item added",
          description: "The item has been added successfully.",
        })
        onSuccess?.add?.(values)
      }
    }, [addItem, form, toast, setDialogOpen, onSuccess])
    
    const handleDelete = React.useCallback(async (id: string) => {
      const success = await removeItem(id)
      if (success) {
        toast({
          title: "Item deleted",
          description: "The item has been deleted.",
          variant: "destructive"
        })
        onSuccess?.delete?.(id)
      }
    }, [removeItem, toast, onSuccess])
  
    const handleDeleteMultiple = React.useCallback(async (ids: string[]) => {
      const success = await removeMultipleItems(ids)
      
      if (success) {
        toast({
          title: "Items deleted",
          description: `${ids.length} item(s) have been deleted.`,
          variant: "destructive"
        })
        onSuccess?.deleteMultiple?.(ids)
      }
    }, [removeMultipleItems, toast, onSuccess])
  
    return {
      handleAdd,
      handleDelete,
      handleDeleteMultiple
    }
  }