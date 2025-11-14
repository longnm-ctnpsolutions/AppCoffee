"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/shared/components/ui/form";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table"
import { ClientsProvider, useClientsState, useClientsActions } from "@/shared/context/clients-context"
import { PermissionsProvider, usePermissionsStateActions, usePermissionsState } from "@/shared/context/permissions-context"
import { useRolePermissionsState, useRolePermissionsStateActions } from '@/shared/context/roles-permissions-context';

import { ChevronDown } from "lucide-react";
import type { Permission } from "@/types/permissions.types";
import {
  Checkbox
} from "@/shared/components/ui/checkbox"
import { Client } from "@/features/clients/types/client.types"
import { useToast } from "@/shared/hooks/use-toast";

interface AddPermissionFormProps {
  roleId: string;
  onAddPermissions?: (permissionIds: string[]) => void;
}

type FormValues = {
  id: string;
  name: string;
  description: string;
};

const AddPermissionForm: React.FC<AddPermissionFormProps> = ({ roleId, onAddPermissions }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [selectedClientId, setSelectedClientId] = React.useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  const [inputValue, setInputValue] = React.useState("");
  const [localValue, setLocalValue] = React.useState("");

  const form = useForm<FormValues>({
    defaultValues: {
      id: "",
      name: "",
      description: "",
    },
  });

  const { searchClientsByField } = useClientsActions();

  const { fetchAllPermissions } = usePermissionsStateActions(selectedClientId ?? "");

  const { fetchAllRolePermissions } = useRolePermissionsStateActions(roleId)

  const permissionState = usePermissionsState();
  const rolePermissionState = useRolePermissionsState();

  const hasFetchedSearchClientsRef = React.useRef(false);

  const { toast } = useToast();

  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!selectedClientId) return;

    fetchAllPermissions(selectedClientId);
  }, [selectedClientId]);

  React.useEffect(() => {
    if (!selectedClientId) return;

    fetchAllRolePermissions();
  }, [selectedClientId]);

  const [filteredPermissions, setFilteredPermissions] = React.useState<Permission[]>([]);

  React.useEffect(() => {

    if (!selectedClientId) return;

    // khi chưa có dữ liệu thì reset
    if (!permissionState.allPermissions) {
      setLoading(false);
      return;
    }

    const roleIds = new Set(rolePermissionState.allPermissions.map(r => r.id));
    const filtered = permissionState.allPermissions.filter(
      p => !roleIds.has(p.id)
    );

    setFilteredPermissions(filtered);
    setPermissions(permissionState.allPermissions);
    setSelectedPermissions([]);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [permissionState.allPermissions, rolePermissionState.allPermissions, selectedClientId, rolePermissionState.rolePermissions]);


  //debounce input
  const [searcPermissionResults, setSearchPermissionResults] = React.useState<Permission[]>([]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (!inputValue.trim()) {
        setSearchPermissionResults(filteredPermissions); // input rỗng → show tất cả
      } else {
        const term = inputValue.toLowerCase();
        const result = filteredPermissions.filter(p =>
          p.name.toLowerCase().includes(term)
        );
        setSearchPermissionResults(result);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue, filteredPermissions]);

  //debounce input client
  const [searchResults, setSearchResults] = React.useState<Client[]>([]);

  React.useEffect(() => {
    if (!isDialogOpen || hasFetchedSearchClientsRef.current) return;

    const fetchClients = async () => {
      const res = await searchClientsByField("name", localValue);
      setSearchResults(res?.clients ?? []);
      hasFetchedSearchClientsRef.current = true;
    };

    fetchClients();
  }, [isDialogOpen]);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const [nameValue, setNameValue] = React.useState("");

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    }

    const currentName = form.getValues("name");
    setNameValue(currentName);

    if (isPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopoverOpen]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setFilteredPermissions([]);
      setSearchPermissionResults([])
    }
  }, [isDialogOpen]);

  const onSubmit = (values: FormValues) => {
    if (!values.name.trim()) return;

    if (selectedPermissions.length === 0) {
      toast({
        title: "Error",
        description: "Permission must not be empty!",
        variant: "destructive",
      });
      return;
    };

    const selectedIds = selectedPermissions;
    console.log(roleId);

    onAddPermissions?.(selectedIds);

    const fetchAndSet = async () => {
      try {
        setPermissions(permissionState.allPermissions || []);
        setSelectedPermissions([]);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAndSet();

    form.reset();
    setPermissions([]);
    setSelectedPermissions([]);
    setNameValue("");
    setIsDialogOpen(false);
    setSelectedClientId(null);
    setInputValue("");
  };


  const handleCancel = () => {
    form.reset();
    setPermissions([]);
    setSelectedPermissions([]);
    setNameValue("");
    setIsDialogOpen(false);
    setSelectedClientId(null);
    setInputValue("");
  }

  const SkeletonItem = () => (
    <div className="animate-pulse bg-muted rounded-md p-2 h-[60px] border flex items-center gap-2">
      <div className="w-4 h-4 bg-gray-300 rounded-sm" />
      <div className="h-4 bg-gray-300 rounded w-3/4" />
    </div>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Assign Permission</Button>
      </DialogTrigger>

      <DialogContent
        className="
    w-[80vw] max-h-[90vh]
    sm:max-w-[80vw] sm:max-h-[90vh]
    transition-all
    max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:max-h-none
    max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col
  "
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="border-b-2 pb-4 max-sm:p-4">
          <DialogHeader>
            <DialogTitle className="max-sm:text-left">Add Permission</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex-1 max-sm:p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Client is required" }}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-10">
                    {/* Label bên trái */}
                    <FormLabel className="whitespace-nowrap">
                      Assign Permissions
                    </FormLabel>

                    {/* Input bên phải, chiếm toàn bộ chiều ngang còn lại */}
                    <FormControl className="flex-1">
                      <div ref={dropdownRef} className="relative w-full">
                        <Input
                          placeholder="Select client..."
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val);
                            setLocalValue(val);
                            if (!isPopoverOpen) {
                              setIsPopoverOpen(true);
                            }
                          }}
                          onClick={() => {
                            const open = !isPopoverOpen;
                            setIsPopoverOpen(open);
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => {
                            const open = !isPopoverOpen;
                            setIsPopoverOpen(open);
                          }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>

                        {isPopoverOpen && (
                          <div className="absolute z-10 mt-1 w-full bg-background border rounded shadow max-h-48 overflow-auto">
                            <ul>
                              {searchResults.length === 0 && (
                                <li className="px-3 py-2 text-gray-400">No clients found</li>
                              )}
                              {searchResults.map(client => (
                                <li
                                  key={client.id}
                                  className="cursor-pointer px-3 py-2 hover:bg-accent text-sm"
                                  onClick={() => {
                                    form.setValue("name", client.name ?? "");
                                    setIsPopoverOpen(false);
                                    setSelectedClientId(client.id);
                                    setLoading(true);
                                  }}
                                >
                                  {client.name}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </FormControl>

                  </FormItem>
                )}
              />

              {nameValue?.trim() !== "" && (
                <div className="flex items-center gap-2 mb-2 justify-end">
                  <span className="font-medium">Select:</span>
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setSelectedPermissions(permissions.map(p => p.id))}
                  >
                    All
                  </span>
                  <span>
                    |
                  </span>
                  <span
                    className="text-blue-600 cursor-pointer"
                    onClick={() => setSelectedPermissions([])}
                  >
                    None
                  </span>
                  <Input
                    placeholder="Search Permission"
                    className="flex-1 min-w-[70px] max-w-[200px] max-h-[30] bg-background ml-2"
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
              )}

              {selectedClientId && (
                loading ? (
                  <div className="mt-4 border p-3 rounded">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 max-h-[300px] overflow-y-auto px-2">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <SkeletonItem key={index} />
                      ))}
                    </div>
                  </div>
                ) : searcPermissionResults.length > 0 ? (
                  <div className="mt-4 border p-3 rounded">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-3 max-h-[300px] overflow-y-auto px-2">
                      {searcPermissionResults
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-center gap-2 bg-background rounded-md p-2 text-sm cursor-pointer border h-[60px]"
                          >
                            <Checkbox
                              checked={selectedPermissions.includes(perm.id)}
                              onCheckedChange={(checked) => {
                                setSelectedPermissions((prev) =>
                                  checked
                                    ? [...prev, perm.id]
                                    : prev.filter((id) => id !== perm.id)
                                );
                              }}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{perm.name}</span>
                            </div>
                          </label>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-center text-gray-500">
                    No permission available
                  </div>
                )
              )}

              <DialogFooter className="!justify-center gap-2 max-sm:flex-row max-sm:justify-center max-sm:pb-4 pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" size="sm">
                  Assign
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>

  )
}

const AddPermissionWrapper: React.FC<AddPermissionFormProps> = (props) => {
  return (


    <PermissionsProvider>
      <ClientsProvider>
        <AddPermissionForm {...props} />
      </ClientsProvider>
    </PermissionsProvider>

  );
};


export default AddPermissionWrapper;
