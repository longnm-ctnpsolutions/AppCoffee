import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/shared/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useForm } from 'react-hook-form';

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { useRolesActions } from "@/shared/context/roles-context";


interface FormData {
  name: string;
  description?: string;
}

interface AddRoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddRoleDialog: React.FC<AddRoleDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onSubmit',
    shouldFocusError: false,
  });

  const { fetchRolesByField, addRole, fetchRoles, searchTerm } = useRolesActions();

  const [activeTooltip, setActiveTooltip] = React.useState<keyof FormData | null>(null);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setActiveTooltip(null);
      onOpenChange(false);
    }
  }, [isOpen]);

  const onSubmit = async (data: FormData) => {
    
    await addRole({
      name: data.name,
      description: data.description,
    });
  };

  const handleCancel = () => {
    form.reset();
    setActiveTooltip(null);
    onOpenChange(false);
  };

  async function validateName(value: string): Promise<true | string> {
    if (!value) return "This field is required.";

    const validRegex = /^[a-zA-Z0-9 ]*$/;
    if (!validRegex.test(value)) return "The input value must not contain special characters.";

    const result = await fetchRolesByField("name", value);

    if (result && Array.isArray(result.roles) && result.roles.length > 0) {
      return "This role name is already in use.";
    }

    return true;
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col"
          onInteractOutside={(e) => e.preventDefault()}>
          <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
            <DialogHeader>
              <DialogTitle className="max-sm:text-left">Add Role</DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto max-sm:pl-4 max-sm:pr-4 max-sm:pb-4 max-sm:pt-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ validate: validateName }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={form.formState.errors.name ? "text-destructive" : ""}>
                        Role Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Tooltip open={activeTooltip === "name"}>
                          <TooltipTrigger asChild>
                            <div className="relative w-full">
                              <Input
                                {...field}
                                autoComplete="off"
                                maxLength={100}
                                placeholder="Enter role name"
                                className={form.formState.errors.name ? "pr-10 border-destructive" : ""}
                                onChange={async (e) => {
                                  field.onChange(e);

                                  const value = e.target.value;
                                  const error = await validateName(value);
                                  if (error !== true) {
                                      form.setError("name", { message: error });
                                      setActiveTooltip("name");
                                  } else {
                                      form.clearErrors("name");
                                      setActiveTooltip(null);
                                  }
                                }}
                                onBlur={() => {
                                  // khi mất focus thì đóng tooltip
                                  setActiveTooltip(null);
                                }}

                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (form.formState.errors.name) {
                                    setActiveTooltip("name");
                                  } else {
                                    setActiveTooltip(null);
                                  }
                                }}
                              />
                              {form.formState.errors.name && (
                                <AlertCircle
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                />
                              )}
                            </div>
                          </TooltipTrigger>
                          {form.formState.errors.name && (
                            <TooltipContent side="bottom"
                              align="start"
                              sideOffset={0}
                              className="bg-destructive text-white text-xs">
                              <p>{form.formState.errors.name.message}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter description" {...field} autoComplete="off" maxLength={500} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          <DialogFooter className="!justify-center gap-2 max-sm:flex-row max-sm:justify-center max-sm:pb-4 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="sm" onClick={form.handleSubmit(onSubmit)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default AddRoleDialog;
