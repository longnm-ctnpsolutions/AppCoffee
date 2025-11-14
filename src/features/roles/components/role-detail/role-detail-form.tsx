import * as React from "react"
import { Card } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Button } from "@/shared/components/ui/button"
import { Pencil, RefreshCcw, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRolesActions, useRoleDetail, useRolesState } from "@/context/roles-context"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { useForm } from 'react-hook-form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';

// Type for form data matching API structure
interface RoleFormData {
  id: string;
  name: string;
  description: string;
}

interface RoleDetailsFormProps {
  error?: string | null;
  canEdit?: boolean;
}

const RoleDetailsForm: React.FC<RoleDetailsFormProps> = ({ error, canEdit }) => {
  const [isEditable, setIsEditable] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { updateRoleData, fetchRolesByField } = useRolesActions();
  const { selectedRole } = useRoleDetail();

  const form = useForm<RoleFormData>({
    defaultValues: {
      id: selectedRole?.id || "",
      name: selectedRole?.name || "",
      description: selectedRole?.description || "",
    },
  });

  // Update khi selectedRole thay đổi
  useEffect(() => {
    if (selectedRole) {
      form.reset({
        id: selectedRole.id || "",
        name: selectedRole.name || "",
        description: selectedRole.description || "",
      });
      setIsEditable(false);
    }
  }, [selectedRole]);

  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  async function validateRole(value: string): Promise<true | string> {
    if (!value) return "This field is required.";

    const validRegex = /^[a-zA-Z0-9_ ]+$/;
    if (!validRegex.test(value)) {
      return "The input value must not contain special characters.";
    }

    const result = await fetchRolesByField("name", value);
    if (
      result &&
      Array.isArray(result.roles) &&
      result.roles.length > 0
    ) {

      const conflict = result.roles.find((r: any) => r.id !== selectedRole?.id);
      if (conflict) {
        return "A role with this name already exists.";
      }
    }

    return true;
  }

  const onSubmit = async (data: RoleFormData) => {
    if (!selectedRole?.id) return;

    setIsSaving(true);

    try {
      const updateData = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
      };

      await updateRoleData(selectedRole.id, updateData);
    } catch (error) {
      console.error("❌ Unexpected error during role update:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setIsEditable(false);
  };

  return (
    <>
      {/* Details form card */}
      <Card className="space-y-4 p-6 shadow-md border border-gray-100">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Action buttons */}
            {canEdit && (
              <div className="flex justify-end gap-x-2">
                {isEditable ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      type="button"
                      onClick={handleCancel}
                      disabled={isDeactivating || isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      type="submit"
                      className="bg-[#0f6cbd] text-white hover:bg-[#084c91]"
                      disabled={isSaving || !form.formState.isDirty}
                    >
                      {isSaving ? (
                        <>
                          <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="bg-[#0f6cbd] text-white hover:bg-[#084c91]"
                    type="button"
                    onClick={() => setIsEditable(true)}
                    disabled={isDeactivating || isSaving}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            )}

            {/* Role ID */}
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role ID</FormLabel>
                  <FormControl>
                    <Input disabled className="bg-transparent" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Role Name */}
            <FormField
              control={form.control}
              name="name"
              rules={{ validate: validateRole }}
              render={({ field }) => (
                <FormItem className="flex-1 min-w-0">
                  <FormLabel>
                    Role Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Tooltip open={activeTooltip === "name"}>
                      <TooltipTrigger asChild>
                        <div className="relative w-full">
                          <Input
                            disabled={!isEditable}
                            className={`bg-transparent w-full ${form.formState.errors.name ? "pr-10 border-destructive" : ""}`}
                            placeholder="Enter role name"
                            maxLength={100}
                            autoComplete="off"
                            {...field}
                            onChange={async (e) => {
                              const value = e.target.value;
                              field.onChange(value);

                              // validate
                              const error = await validateRole(value);
                              if (error !== true) {
                                form.setError("name", { message: error });
                                setActiveTooltip("name");
                              } else {
                                form.clearErrors("name");
                                setActiveTooltip(null);
                              }
                            }}
                            onBlur={() => setActiveTooltip(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (form.formState.errors.name) setActiveTooltip("name");
                              else setActiveTooltip(null);
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
                        <TooltipContent
                          side="bottom"
                          align="start"
                          sideOffset={0}
                          className="bg-destructive text-white text-xs"
                        >
                          <p>{form.formState.errors.name.message}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </FormControl>
                </FormItem>
              )}
            />


            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={!isEditable}
                      maxLength={500}
                      autoComplete="off"
                      className="bg-transparent"
                      placeholder="Enter description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Card>
    </>
  );

};

export default RoleDetailsForm;
