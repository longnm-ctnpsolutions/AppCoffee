import * as React from "react";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/components/ui/form";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { AlertCircle } from "lucide-react";
import { usePermissionsState, usePermissionsStateActions } from '@/context/permissions-context';
import { useToast } from "@/shared/hooks/use-toast";

interface PermissionFormData {
  permission: string;
  description: string;
}
interface AddPermissionFormProps {
  onAddPermission?: (permissionName: string, description: string) => void;
  clientId: string;
}

const AddPermissionForm: React.FC<AddPermissionFormProps> = ({ onAddPermission, clientId }) => {
  const form = useForm<PermissionFormData>({
    defaultValues: {
      permission: "",
      description: "",
    },
    mode: "onChange",
    criteriaMode: "all",
  });
  const { permissions } = usePermissionsState();

  const { searchClientPermissionsByField } = usePermissionsStateActions(clientId);

  const { toast } = useToast();

  const onSubmit = (data: PermissionFormData) => {
    if (!data.permission.trim()) return;

    const success = onAddPermission?.(data.permission.trim(), data.description.trim());

    if (success){
      toast({
        title: "Success",
        description: "Permission created successfully!",
        variant: "default",
      });
    }
    
    form.reset();
  };

  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  async function validatePermission(value: string): Promise<true | string> {
    if (!value) return "This field is required.";

    const result = await searchClientPermissionsByField("name", value, clientId)
    if (result && Array.isArray(result.permissions) && result.permissions.length > 0) {
      return "This permission has already been assigned to this client.";
    }
    return true;
  }

  return (
    <Card className="rounded-[8px] border pt-[20px] pb-[40px] px-[24px] space-y-4 shadow-lg border-gray-200 flex-shrink-0">
      <div className="text-lg font-semibold">Add a Permission</div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row w-full gap-4 md:items-end">
          <FormField
            control={form.control}
            name="permission"
            rules={{
              validate: (value) => validatePermission(value)
            }}
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0">
                <FormLabel>
                  Permission <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Tooltip open={activeTooltip === "permission"}>
                    <TooltipTrigger asChild>
                      <div className="relative w-full">
                        <Input
                          {...field}
                          autoComplete="off"
                          maxLength={100}
                          placeholder="Enter permission name"
                          className={`bg-transparent w-full ${form.formState.errors.permission ? "pr-10 border-destructive" : ""
                            }`}
                          onChange={async (e) => {
                            const value = e.target.value;
                            field.onChange(value);

                            // validate
                            const error = await validatePermission(value);
                            if (error !== true) {
                              form.setError("permission", { message: error });
                              setActiveTooltip("permission");
                            } else {
                              form.clearErrors("permission");
                              setActiveTooltip(null);
                            }
                          }}
                          onBlur={() => {
                            // mất focus đóng tooltip
                            setActiveTooltip(null);
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (form.formState.errors.permission) {
                              setActiveTooltip("permission");
                            } else {
                              setActiveTooltip(null);
                            }
                          }}
                        />
                        {form.formState.errors.permission && (
                          <AlertCircle
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                          />
                        )}
                      </div>
                    </TooltipTrigger>
                    {form.formState.errors.permission && (
                      <TooltipContent
                        side="bottom"
                        align="start"
                        sideOffset={0}
                        className="bg-destructive text-white text-xs"
                      >
                        <p>{form.formState.errors.permission.message}</p>
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
            rules={{
              validate: (value) => {
                if (!value || value.trim() === "") {
                  return "This field is required.";
                }
                return true;
              }
            }}
            render={({ field }) => (
              <FormItem className="flex-1 min-w-0">
                <FormLabel className={form.formState.errors.description ? "text-destructive" : ""}>
                  Description <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Tooltip open={activeTooltip === "description"}>
                    <TooltipTrigger asChild>
                      <div className="relative w-full">
                        <Input
                          {...field}
                          maxLength={500}
                          className={`bg-transparent w-full ${form.formState.errors.description ? "pr-10 border-destructive" : ""}`}
                          placeholder="Enter description"
                          onChange={(e) => {
                            field.onChange(e.target.value);

                            const error = !e.target.value.trim() ? "This field is required." : true;
                            if (error !== true) {
                              form.setError("description", { message: error });
                              setActiveTooltip("description");
                            } else {
                              form.clearErrors("description");
                              setActiveTooltip(null);
                            }
                          }}
                          onBlur={() => setActiveTooltip(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (form.formState.errors.description) {
                              setActiveTooltip("description");
                            } else {
                              setActiveTooltip(null);
                            }
                          }}
                        />
                        {form.formState.errors.description && (
                          <AlertCircle
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                          />
                        )}
                      </div>
                    </TooltipTrigger>
                    {form.formState.errors.description && (
                      <TooltipContent
                        side="bottom"
                        align="start"
                        sideOffset={0}
                        className="bg-destructive text-white text-xs"
                      >
                        <p>{form.formState.errors.description.message}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </FormControl>
              </FormItem>
            )}
          />


          <div className="flex-shrink-0 flex justify-end md:justify-start">
            <Button
              type="submit"
              size="sm"
              className="w-auto md:w-[70px] bg-[#0f6cbd] text-white hover:bg-[#084c91]"
              disabled={!form.formState.isValid}
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default AddPermissionForm;
