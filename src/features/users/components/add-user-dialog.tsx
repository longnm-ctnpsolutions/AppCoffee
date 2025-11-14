import React, { useState } from 'react';
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
import { useForm } from 'react-hook-form';

import { useEffect, useRef } from "react";
import { AlertCircle, ChevronDown, Eye, EyeOff, X } from "lucide-react";
import { useUsersActions } from "@/shared/context/users-context";
import {
    ColumnFiltersState,
    SortingState,
    type PaginationState,
} from "@tanstack/react-table";
import { useRolesActions, useRolesState, RolesProvider } from '@/shared/context/roles-context';
import { Role } from '@/features/roles/types/role.types';


interface FormData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role?: Role[];
}

interface AddUserDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
    isOpen,
    onOpenChange,
}) => {
    const form = useForm<FormData>({
        defaultValues: {
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            role: []
        },
        mode: 'onSubmit',
        shouldFocusError: false,
    });

    const [searchField, setSearchField] = React.useState<keyof FormData>("email");

    // Mặc định là Name
    const [searchValue, setSearchValue] = React.useState("");
    const { fetchUsersByField, addUser, fetchUsers, searchTerm, getUserDetails } = useUsersActions();
    const isFirstRun = useRef(true);

    const [activeTooltip, setActiveTooltip] = React.useState<keyof FormData | null>(null);

    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const { fetchRoles } = useRolesActions();
    const state = useRolesState();
    const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);
    const [showPassword, setShowPassword] = React.useState(false);

    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setActiveTooltip(null);
            onOpenChange(false);
        }
    }, [isOpen]);

    // ✅ STABLE TABLE STATE
    const [sorting] = React.useState<SortingState>([]);
    const [columnFilters] = React.useState<ColumnFiltersState>([]);
    const [pagination] = React.useState<PaginationState>({
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
        const success = await addUser({
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: data.password,
            roles: data.role?.map(e => e.id),
            lockoutEnabled: false
        });

        if (success) {
            console.log("Form submitted:", data);
            form.reset();
            setActiveTooltip(null);
            onOpenChange(false);
        }
        else {
            console.log("failed");
        }
    };

    const handleCancel = () => {
        form.reset();
        setActiveTooltip(null);
        onOpenChange(false);
    };

    async function validateEmail(value: string): Promise<true | string> {
        if (!value) return "This field is required.";

        const validRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!validRegex.test(value)) return "The input value must not contain special characters.";

        const result = await fetchUsersByField("email", value);

        if (result && Array.isArray(result.users) && result.users.length > 0) {
            return "This email is already in use.";
        }

        return true;
    }

    function validateSpecificName(value: string): true | string {
        if (!value) return "This field is required.";

        // Regex: chỉ cho phép chữ cái và khoảng trắng
        const regex = /^[A-Za-zÀ-ỹ\s]+$/u;

        if (!regex.test(value)) {
            return "Name must not contain numbers or special characters.";
        }

        return true;
    }

    function validatePassword(value: string): true | string {
        if (!value) return "This field is required.";

        if (value.length < 8) return "Password must be at least 8 characters.";

        if (!/^[A-Z]/.test(value)) return "Password must start with an uppercase letter.";

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
            return "Password must contain at least one special character.";
        return true;
    }



    return (
        <TooltipProvider>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col"
                    onInteractOutside={(e) => e.preventDefault()}>
                    <div className="border-b-2 pb-4 max-sm:p-4 max-sm:border-b-2">
                        <DialogHeader>
                            <DialogTitle className="max-sm:text-left">Add User</DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 max-sm:pl-4 max-sm:pr-4 max-sm:pb-4 max-sm:pt-0">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    rules={{ validate: validateEmail }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={form.formState.errors.email ? "text-destructive" : ""}>
                                                Email <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Tooltip open={activeTooltip === "email"}>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative w-full">
                                                            <Input
                                                                {...field}
                                                                autoComplete="off"
                                                                placeholder="Enter email"
                                                                className={form.formState.errors.email ? "pr-10 border-destructive" : ""}
                                                                maxLength={100}
                                                                onChange={async (e) => {
                                                                    field.onChange(e);
                                                                    setSearchField("email");
                                                                    setSearchValue(e.target.value);

                                                                    const value = e.target.value;
                                                                    const error = await validateEmail(value);
                                                                    if (error !== true) {
                                                                        form.setError("email", { message: error });
                                                                        setActiveTooltip("email");
                                                                    } else {
                                                                        form.clearErrors("email");
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    // khi mất focus thì đóng tooltip
                                                                    setActiveTooltip(null);
                                                                }}

                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (form.formState.errors.email) {
                                                                        setActiveTooltip("email");
                                                                    } else {
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }}
                                                            />
                                                            {form.formState.errors.email && (
                                                                <AlertCircle
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                                                />
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {form.formState.errors.email && (
                                                        <TooltipContent side="bottom"
                                                            align="start"
                                                            sideOffset={0}
                                                            className="bg-destructive text-white text-xs">
                                                            <p>{form.formState.errors.email.message}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    rules={{ validate: validateSpecificName }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={form.formState.errors.firstName ? "text-destructive" : ""}>
                                                First Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Tooltip open={activeTooltip === "firstName"}>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative w-full">
                                                            <Input className={form.formState.errors.firstName ? "pr-10 border-destructive" : ""}
                                                                placeholder="Enter first name" {...field}
                                                                autoComplete="off"
                                                                maxLength={100}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    // setSearchField("firstName");
                                                                    // setSearchValue(e.target.value);

                                                                    const value = e.target.value;
                                                                    const error = validateSpecificName(value);
                                                                    if (error !== true) {
                                                                        form.setError("firstName", { message: error });
                                                                        setActiveTooltip("firstName");
                                                                    } else {
                                                                        form.clearErrors("firstName");
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    // khi mất focus thì đóng tooltip
                                                                    setActiveTooltip(null);
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (form.formState.errors.firstName) {
                                                                        setActiveTooltip("firstName");
                                                                    } else {
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }} />
                                                            {form.formState.errors.firstName && (
                                                                <AlertCircle
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                                                />
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {form.formState.errors.firstName && (
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={0}
                                                            className="bg-destructive text-white text-xs"
                                                        >
                                                            <p>{form.formState.errors.firstName.message}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    rules={{ validate: validateSpecificName }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={form.formState.errors.lastName ? "text-destructive" : ""}>
                                                Last Name <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Tooltip open={activeTooltip === "lastName"}>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative w-full" >
                                                            <Input className={form.formState.errors.lastName ? "pr-10 border-destructive" : ""}
                                                                placeholder="Enter last name" {...field}
                                                                autoComplete="off"
                                                                maxLength={100}
                                                                onChange={(e) => {
                                                                    field.onChange(e);
                                                                    // setSearchField("lastName");
                                                                    // setSearchValue(e.target.value);

                                                                    const value = e.target.value;
                                                                    const error = validateSpecificName(value);
                                                                    if (error !== true) {
                                                                        form.setError("lastName", { message: error });
                                                                        setActiveTooltip("lastName");
                                                                    } else {
                                                                        form.clearErrors("lastName");
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }}
                                                                onBlur={() => {
                                                                    // khi mất focus thì đóng tooltip
                                                                    setActiveTooltip(null);
                                                                }}

                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (form.formState.errors.lastName) {
                                                                        setActiveTooltip("lastName");
                                                                    } else {
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }} />
                                                            {form.formState.errors.lastName && (
                                                                <AlertCircle
                                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive w-4 h-4 pointer-events-none"
                                                                />
                                                            )}
                                                        </div>
                                                    </TooltipTrigger>
                                                    {form.formState.errors.lastName && (
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={0}
                                                            className="bg-destructive text-white text-xs"
                                                        >
                                                            <p>{form.formState.errors.lastName.message}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{ validate: validatePassword }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={form.formState.errors.password ? "text-destructive" : ""}>
                                                Password <span className="text-destructive">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Tooltip open={activeTooltip === "password"}>
                                                    <TooltipTrigger asChild>
                                                        <div className="relative w-full">
                                                            <Input className={
                                                                form.formState.errors.password
                                                                    ? "mt-1 border-destructive pr-10"
                                                                    : "mt-1 pr-10"
                                                            } type={showPassword ? "text" : "password"} placeholder="Enter password" {...field} autoComplete="off" onChange={(e) => {
                                                                field.onChange(e);
                                                                // setSearchField("password");
                                                                // setSearchValue(e.target.value);

                                                                const value = e.target.value;
                                                                const error = validatePassword(value);
                                                                if (error !== true) {
                                                                    form.setError("password", { message: error });
                                                                    setActiveTooltip("password");
                                                                } else {
                                                                    form.clearErrors("password");
                                                                    setActiveTooltip(null);
                                                                }
                                                            }}
                                                                onBlur={() => {
                                                                    // khi mất focus thì đóng tooltip
                                                                    setActiveTooltip(null);
                                                                }}

                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (form.formState.errors.password) {
                                                                        setActiveTooltip("password");
                                                                    } else {
                                                                        setActiveTooltip(null);
                                                                    }
                                                                }} />

                                                            <button
                                                                type="button"
                                                                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                                                                onClick={() => setShowPassword((prev) => !prev)}
                                                            >
                                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    {form.formState.errors.password && (
                                                        <TooltipContent
                                                            side="bottom"
                                                            align="start"
                                                            sideOffset={0}
                                                            className="bg-destructive text-white text-xs"
                                                        >
                                                            <p>{form.formState.errors.password.message}</p>
                                                        </TooltipContent>
                                                    )}
                                                </Tooltip>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            {/* Label bên trái */}
                                            <FormLabel>
                                                Assign Roles
                                            </FormLabel>

                                            {/* Input bên phải */}
                                            <FormControl>
                                                <div ref={dropdownRef} className="relative w-full">
                                                    <div
                                                        className="flex flex-wrap items-center gap-1 border rounded-lg px-2 py-1 min-h-[40px] cursor-pointer"
                                                        onClick={() => {
                                                            const open = !isPopoverOpen;
                                                            setIsPopoverOpen(open);
                                                            if (open) fetchRoles(tableState);
                                                        }}
                                                    >
                                                        {/* Hiển thị các tag */}
                                                        {Array.isArray(field.value) && field.value.length > 0 ? (
                                                            field.value.map((role: Role, idx: number) => (
                                                                <span
                                                                    key={idx}
                                                                    className="flex items-center gap-1 bg-background text-sm px-2 py-0.5 rounded-full"
                                                                >
                                                                    {role.name}
                                                                    <button
                                                                        type="button"
                                                                        className="hover:text-red-500"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const newValues = field.value?.filter(
                                                                                (r: Role) => r.id !== role.id
                                                                            );
                                                                            form.setValue("role", newValues);

                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </button>
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">Select role...</span>
                                                        )}

                                                        {/* Nút dropdown */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="ml-auto h-7 w-7 p-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const open = !isPopoverOpen;
                                                                setIsPopoverOpen(open);
                                                                if (open) fetchRoles(tableState);
                                                            }}
                                                        >
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    {/* Dropdown menu */}
                                                    {isPopoverOpen && (
                                                        <div className="absolute z-10 mt-1 w-full bg-background border rounded-xl shadow max-h-48 overflow-auto">
                                                            <ul>
                                                                {state.roles?.length === 0 && (
                                                                    <li className="px-3 py-2 text-gray-400">No roles found</li>
                                                                )}
                                                                {state.roles?.map((role) => {
                                                                    const current: Role[] = field.value ?? [];
                                                                    const isSelected = current.some((r) => r.id === role.id);

                                                                    return (
                                                                        <li
                                                                            key={role.id}
                                                                            className={`cursor-pointer px-3 py-2 text-sm
                                                                            ${isSelected ? "bg-muted" : ""}
                                                                            hover:bg-muted`}
                                                                            onClick={() => {
                                                                                if (isSelected) {
                                                                                    form.setValue(
                                                                                        "role",
                                                                                        current.filter((r) => r.id !== role.id)
                                                                                    );
                                                                                    setSelectedRoleIds((prev) =>
                                                                                        prev.filter((id) => id !== role.id)
                                                                                    );
                                                                                } else {
                                                                                    form.setValue("role", [...current, role]);
                                                                                    setSelectedRoleIds((prev) => [...prev, role.id]);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {role.name}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="!justify-center gap-2 max-sm:flex-row max-sm:justify-center max-sm:pb-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </DialogClose>
                                    <Button type="submit" size="sm">
                                        Save
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
};

const AddUserDialogWrapper: React.FC<AddUserDialogProps> = (props) => {
    return (
        <RolesProvider>
            <AddUserDialog {...props} />
        </RolesProvider>
    );
};

export default AddUserDialogWrapper;
