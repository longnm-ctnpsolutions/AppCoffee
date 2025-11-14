import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { UserPlus, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useClientsActions, useClientDetail } from "@/shared/context/clients-context";
import { useClientFormState } from "@/features/clients/hooks/use-client-form-state";
import { FileUpload } from "@/features/clients/components/client-detail/client-detail-form-tab/file-upload";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";
import { ScrollArea } from '@/shared/components/ui/scroll-area';
interface FormData {
  name: string;
  identifier: string;
  audience: string;
  issuer: string;
  tokenExpired: number | string;
  description?: string;
  homePageUrl?: string;
  logo?: File | null;
  logoUrl?: string;
}

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddClientDialog: React.FC<AddClientDialogProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      identifier: '',
      description: '',
      audience: '',
      issuer: '',
      tokenExpired: '',
      homePageUrl: '',
      logo: null,
      logoUrl: ''
    },
    mode: 'onSubmit',
    shouldFocusError: false,
  });

  const { selectedClient } = useClientDetail();
  const {
    isEditable,
    setIsEditable,
    clientData,
    originalData,
    hasChanges,
    updateClientData,
    resetToOriginal,
    updateOriginalData
  } = useClientFormState({ selectedClient });

  const { fetchClientsByField, addClient, fetchClients, searchTerm } = useClientsActions();

  const [activeTooltip, setActiveTooltip] = useState<keyof FormData | null>(null);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setActiveTooltip(null);
      onOpenChange(false);
    }
  }, [isOpen, form, onOpenChange]);

  // Stable table state
  const [sorting] = useState<SortingState>([]);
  const [columnFilters] = useState<ColumnFiltersState>([]);
  const [pagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const tableState = React.useMemo(() => ({
    pagination,
    sorting,
    columnFilters,
    globalFilter: searchTerm,
  }), [pagination, sorting, columnFilters, searchTerm]);

  const onSubmit = async (data: FormData) => {
    const success = await addClient({
      name: data.name,
      identifier: data.identifier,
      audience: data.audience,
      issuer: data.issuer,
      tokenExpired: data.tokenExpired,
      description: data.description,
      homePageUrl: data.homePageUrl,
      logoUrl: clientData.logoUrl,
      callbackUrl: null,
      logoutUrl: null
    });

    if (success) {
      console.log("Form submitted:", data);
      form.reset();
      setActiveTooltip(null);
      onOpenChange(false);
      await fetchClients(tableState);
    } else {
      console.log("Failed to add client");
    }
  };

  const handleCancel = () => {
    form.reset();
    setActiveTooltip(null);
    onOpenChange(false);
  };

  function validateUrl(value: string | undefined): true | string {
    if (!value) {
      return true;
    }
    try {
      new URL(value);
      return true;
    } catch {
      return "Homepage URL must be a valid URL";
    }
  }

  const validationTimeout = useRef<NodeJS.Timeout | null>(null);

  async function validateName(value: string | undefined): Promise<true | string> {
    if (!value || value.trim() === "") {
      return "This field is required";
    }

    const validPattern = /^[a-zA-Z0-9 ]*$/;
    if (!validPattern.test(value)) {
      return "No special characters allowed";
    }

    const result = await fetchClientsByField("name", value);
    if (result && Array.isArray(result.clients) && result.clients.length > 0) {
      return "A client with this name already exists";
    }

    return true;
  }

  async function validateIdentifier(value: string | undefined): Promise<true | string> {
    if (!value || value.trim() === "") {
      return "This field is required";
    }

    const validPattern = /^[a-zA-Z0-9 ]*$/; // identifier thường không cho khoảng trắng
    if (!validPattern.test(value)) {
      return "No special characters allowed";
    }

    const result = await fetchClientsByField("identifier", value);
    if (result && Array.isArray(result.clients) && result.clients.length > 0) {
      return "A client with this identifier already exists";
    }

    return true;
  }

  async function validateAudience(value: string | undefined): Promise<true | string> {
    if (!value || value.trim() === "") {
      return "This field is required";
    }

    const result = await fetchClientsByField("audience", value);
    if (result && Array.isArray(result.clients) && result.clients.length > 0) {
      return "A client with this audience already exists";
    }

    return true;
  }

  async function validateIssuer(value: string | undefined): Promise<true | string> {
    if (!value || value.trim() === "") {
      return "This field is required";
    }

    const result = await fetchClientsByField("issuer", value);
    if (result && Array.isArray(result.clients) && result.clients.length > 0) {
      return "A client with this issuer already exists";
    }

    return true;
  }

  function validateTokenExpired(value: string | number | undefined) {
    if (value === undefined || value === null || value.toString().trim() === '') {
      return "Token expired is required";
    }

    // Kiểm tra phải là số dương
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return "Token expired must be a positive number";
    }

    return true;
  }

  const handleFileUploaded = (fileUrl: string) => {
    updateClientData('logoUrl', fileUrl);
    console.log('File uploaded successfully:', fileUrl);
  };

  const handleFileRemoved = () => {
    updateClientData('logoUrl', '');
    console.log('File removed');
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col"
          onInteractOutside={(e) => e.preventDefault()}>
          <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
            <DialogHeader>
              <DialogTitle className="max-sm:text-left">Add Client</DialogTitle>
            </DialogHeader>
          </div>
          <ScrollArea className="flex-1 max-sm:px-4 max-h-[calc(100vh-200px)]">
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
                          Client Name <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Tooltip open={activeTooltip === "name"}>
                            <TooltipTrigger asChild>
                              <div className="relative w-full">
                                <Input
                                  {...field}
                                  maxLength={100}
                                  autoComplete="off"
                                  placeholder="Enter client name"
                                  className={form.formState.errors.name ? "pr-10 border-destructive" : ""}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const value = e.target.value;

                                    if (validationTimeout.current) clearTimeout(validationTimeout.current);

                                    validationTimeout.current = setTimeout(async () => {
                                      const error = await validateName(value);
                                      if (error !== true) {
                                        form.setError("name", { message: error });
                                        setActiveTooltip("name");
                                      } else {
                                        form.clearErrors("name");
                                        setActiveTooltip(null);
                                      }
                                    }, 300);
                                  }}
                                  onBlur={() => setActiveTooltip(null)}
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

                  <FormField
                    control={form.control}
                    name="identifier"
                    rules={{ validate: validateIdentifier }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={form.formState.errors.identifier ? "text-destructive" : ""}>
                          Identifier <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Tooltip open={activeTooltip === "identifier"}>
                            <TooltipTrigger asChild>
                              <div className="relative w-full">
                                <Input
                                  {...field}
                                  maxLength={255}
                                  autoComplete="off"
                                  placeholder="Enter client identifier"
                                  className={form.formState.errors.identifier ? "pr-10 border-destructive" : ""}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const value = e.target.value;

                                    if (validationTimeout.current) clearTimeout(validationTimeout.current);

                                    validationTimeout.current = setTimeout(async () => {
                                      const error = await validateIdentifier(value);
                                      if (error !== true) {
                                        form.setError("identifier", { message: error });
                                        setActiveTooltip("identifier");
                                      } else {
                                        form.clearErrors("identifier");
                                        setActiveTooltip(null);
                                      }
                                    }, 300);
                                  }}
                                  onBlur={() => setActiveTooltip(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (form.formState.errors.identifier) {
                                      setActiveTooltip("identifier");
                                    } else {
                                      setActiveTooltip(null);
                                    }
                                  }}
                                />
                                {form.formState.errors.identifier && (
                                  <AlertCircle
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            {form.formState.errors.identifier && (
                              <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                              >
                                <p>{form.formState.errors.identifier.message}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="audience"
                    rules={{ validate: validateAudience }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={form.formState.errors.audience ? "text-destructive" : ""}>
                          Audience <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Tooltip open={activeTooltip === "audience"}>
                            <TooltipTrigger asChild>
                              <div className="relative w-full">
                                <Input
                                  {...field}
                                  maxLength={255}
                                  autoComplete="off"
                                  placeholder="Enter client audience"
                                  className={form.formState.errors.audience ? "pr-10 border-destructive" : ""}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const value = e.target.value;

                                    if (validationTimeout.current) clearTimeout(validationTimeout.current);

                                    validationTimeout.current = setTimeout(async () => {
                                      const error = await validateAudience(value);
                                      if (error !== true) {
                                        form.setError("audience", { message: error });
                                        setActiveTooltip("audience");
                                      } else {
                                        form.clearErrors("audience");
                                        setActiveTooltip(null);
                                      }
                                    }, 300);
                                  }}
                                  onBlur={() => setActiveTooltip(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (form.formState.errors.audience) {
                                      setActiveTooltip("audience");
                                    } else {
                                      setActiveTooltip(null);
                                    }
                                  }}
                                />
                                {form.formState.errors.audience && (
                                  <AlertCircle
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            {form.formState.errors.audience && (
                              <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                              >
                                <p>{form.formState.errors.audience.message}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issuer"
                    rules={{ validate: validateIssuer }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={form.formState.errors.issuer ? "text-destructive" : ""}>
                          Issuer <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Tooltip open={activeTooltip === "issuer"}>
                            <TooltipTrigger asChild>
                              <div className="relative w-full">
                                <Input
                                  {...field}
                                  maxLength={255}
                                  autoComplete="off"
                                  placeholder="Enter client issuer"
                                  className={form.formState.errors.issuer ? "pr-10 border-destructive" : ""}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const value = e.target.value;

                                    if (validationTimeout.current) clearTimeout(validationTimeout.current);

                                    validationTimeout.current = setTimeout(async () => {
                                      const error = await validateIssuer(value);
                                      if (error !== true) {
                                        form.setError("issuer", { message: error });
                                        setActiveTooltip("issuer");
                                      } else {
                                        form.clearErrors("issuer");
                                        setActiveTooltip(null);
                                      }
                                    }, 300);
                                  }}
                                  onBlur={() => setActiveTooltip(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (form.formState.errors.issuer) {
                                      setActiveTooltip("issuer");
                                    } else {
                                      setActiveTooltip(null);
                                    }
                                  }}
                                />
                                {form.formState.errors.issuer && (
                                  <AlertCircle
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            {form.formState.errors.issuer && (
                              <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                              >
                                <p>{form.formState.errors.issuer.message}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tokenExpired"
                    rules={{ validate: validateTokenExpired }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={form.formState.errors.tokenExpired ? "text-destructive" : ""}>
                          Token Expired (seconds) <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Tooltip open={activeTooltip === "tokenExpired"}>
                            <TooltipTrigger asChild>
                              <div className="relative w-full">
                                <Input
                                  {...field}
                                  type="text"
                                  autoComplete="off"
                                  placeholder="Enter token expiration time in seconds"
                                  value={field.value ?? ''}
                                  className={form.formState.errors.tokenExpired ? "pr-10 border-destructive" : ""}
                                  onChange={(e) => {
                                    const value = e.target.value;

                                    // Chỉ cho phép nhập số, loại bỏ tất cả ký tự khác
                                    const numericValue = value.replace(/[^0-9]/g, '');

                                    // Nếu rỗng thì set undefined, không thì parse thành số
                                    const parsedValue = numericValue ? parseInt(numericValue, 10) : undefined;
                                    field.onChange(parsedValue);

                                    if (validationTimeout.current) clearTimeout(validationTimeout.current);

                                    validationTimeout.current = setTimeout(() => {
                                      const error = validateTokenExpired(parsedValue);
                                      if (error !== true) {
                                        form.setError("tokenExpired", { message: error });
                                        setActiveTooltip("tokenExpired");
                                      } else {
                                        form.clearErrors("tokenExpired");
                                        setActiveTooltip(null);
                                      }
                                    }, 300);
                                  }}
                                  onBlur={() => setActiveTooltip(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (form.formState.errors.tokenExpired) {
                                      setActiveTooltip("tokenExpired");
                                    } else {
                                      setActiveTooltip(null);
                                    }
                                  }}
                                />
                                {form.formState.errors.tokenExpired && (
                                  <AlertCircle
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            {form.formState.errors.tokenExpired && (
                              <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                              >
                                <p>{form.formState.errors.tokenExpired.message}</p>
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

                  <FormField
                    control={form.control}
                    name="homePageUrl"
                    rules={{ validate: validateUrl }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={form.formState.errors.homePageUrl ? "text-destructive" : ""}>
                          Homepage URL
                        </FormLabel>
                        <FormControl>
                          <Tooltip open={activeTooltip === "homePageUrl"}>
                            <TooltipTrigger asChild>
                              <div className="relative w-full">
                                <Input
                                  {...field}
                                  autoComplete="off"
                                  placeholder="Homepage URL"
                                  className={form.formState.errors.homePageUrl ? "border-destructive pr-10" : ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value);

                                    const error = validateUrl(value);
                                    if (error !== true) {
                                      form.setError("homePageUrl", { message: error });
                                      setActiveTooltip("homePageUrl");
                                    } else {
                                      form.clearErrors("homePageUrl");
                                      setActiveTooltip(null);
                                    }
                                  }}
                                  onBlur={() => setActiveTooltip(null)}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (form.formState.errors.homePageUrl) setActiveTooltip("homePageUrl");
                                    else setActiveTooltip(null);
                                  }}
                                />
                                {form.formState.errors.homePageUrl && (
                                  <AlertCircle
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                  />
                                )}
                              </div>
                            </TooltipTrigger>
                            {form.formState.errors.homePageUrl && (
                              <TooltipContent
                                side="bottom"
                                align="start"
                                sideOffset={0}
                                className="bg-destructive text-white text-xs"
                              >
                                <p>{form.formState.errors.homePageUrl.message}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FileUpload
                    isEditable={true}
                    currentLogoUrl={''}
                    onFileUploaded={handleFileUploaded}
                    onFileRemoved={handleFileRemoved}
                    disabled={false}
                    container=""
                    userId=""
                  />

                </form>
              </Form>
            </div>
          </ScrollArea>

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
    </TooltipProvider >
  );
};

export default AddClientDialog;