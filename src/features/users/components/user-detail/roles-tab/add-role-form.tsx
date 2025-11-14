"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
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
import { useRolesActions, useRolesState, RolesProvider } from "@/shared/context/roles-context";
import { useUserRolesState, useUserRolesStateActions } from '@/shared/context/users-role-context';
import { ChevronDown, X } from "lucide-react";
import { Role } from "@/features/roles/types/role.types";

interface AddRoleFormProps {
    userId: string;
    onAddRole?: (roleIds: string[]) => void;
}

type FormValues = {
    id: string;
    name: string[];
    description: string;
};

const AddRoleForm: React.FC<AddRoleFormProps> = ({ userId, onAddRole }) => {
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    const [selectedRoleIds, setSelectedRoleIds] = React.useState<string[]>([]);

    const form = useForm<FormValues>({
        defaultValues: {
            id: "",
            name: [],
            description: "",
        },
    });

    const roleState = useRolesState();
    const userRoleState = useUserRolesState();

    const { fetchAllRoles } = useRolesActions();

    const { fetchAllUserRoles } = useUserRolesStateActions(userId)
    const hasFetchedRef = React.useRef(false);

    React.useEffect(() => {
        if (!isDialogOpen || hasFetchedRef.current) return;

        const fetchData = async () => {
            await Promise.all([
                fetchAllRoles(),
                fetchAllUserRoles(),
            ]);
            hasFetchedRef.current = true;
        };

        fetchData();
    }, [isDialogOpen]);

    const [availableRoles, setAvailableRoles] = React.useState<Role[]>([]);

    React.useEffect(() => {
        if (!roleState.allRoles || !userRoleState.allUserRoles) return;

        const roleIds = new Set(userRoleState.allUserRoles.map(r => r.id));
        const filtered = roleState.allRoles.filter(p => !roleIds.has(p.id));

        setAvailableRoles(filtered);
    }, [roleState.allRoles, userRoleState.allUserRoles, selectedRoleIds]);


    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsPopoverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const onSubmit = (values: FormValues) => {
        //if (!values.name.trim()) return;
        const selectedIds = selectedRoleIds;

        onAddRole?.(selectedIds);

        form.reset();
        setSelectedRoleIds([]);
        setIsDialogOpen(false);
    };

    const handleCancel = () => {
        form.reset();
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button size="sm">Assign Roles</Button>
            </DialogTrigger>

            <DialogContent
                className="w-[650px] max-w-[90vw] max-sm:w-full max-sm:h-full max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:p-0 max-sm:flex max-sm:flex-col"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <div className="border-b-2 pb-4 max-sm:p-4">
                    <DialogHeader>
                        <DialogTitle className="max-sm:text-left">Assign Roles</DialogTitle>
                    </DialogHeader>
                </div>

                <div className="flex-1 max-sm:p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                rules={{ required: "Role is required" }}
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-10">
                                        {/* Label bên trái */}
                                        <FormLabel className="whitespace-nowrap">
                                            Assign Roles
                                        </FormLabel>

                                        {/* Input bên phải, chiếm toàn bộ chiều ngang còn lại */}

                                        <FormControl className="flex-1">
                                            <div ref={dropdownRef} className="relative w-full">
                                                <div
                                                    className="flex flex-wrap items-center gap-1 border rounded-lg px-2 py-1 min-h-[40px] cursor-pointer"
                                                    onClick={() => {
                                                        const open = !isPopoverOpen;
                                                        setIsPopoverOpen(open);
                                                    }}
                                                >
                                                    {/* Hiển thị các tag */}
                                                    {Array.isArray(field.value) && field.value.length > 0 ? (
                                                        field.value.map((email: string, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="flex items-center gap-1 bg-background text-sm px-2 py-0.5 rounded-full"
                                                            >
                                                                {email}
                                                                <button
                                                                    type="button"
                                                                    className="hover:text-red-500"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();

                                                                        const newValues = field.value.filter((v: string) => v !== email);
                                                                        form.setValue("name", newValues);

                                                                        const removedRole = availableRoles.find(u => u.name === email);
                                                                        if (removedRole) {
                                                                            setSelectedRoleIds(prev => prev.filter(id => id !== removedRole.id));
                                                                        }
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
                                                        }}
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {isPopoverOpen && (
                                                    <div className="absolute z-10 mt-1 w-full bg-background border rounded-xl shadow max-h-48 overflow-auto">
                                                        <ul>
                                                            {availableRoles.length === 0 && (
                                                                <li className="px-3 py-2 text-gray-400">No roles found</li>
                                                            )}
                                                            {availableRoles.map(role => {
                                                                const current = (field.value as string[]) ?? [];
                                                                const name = role.name ?? "";
                                                                const isSelected = current.includes(name);

                                                                return (
                                                                    <li
                                                                        key={role.id}
                                                                        className={`cursor-pointer px-3 py-2 text-sm
                                                                        ${isSelected ? "bg-accent" : ""}
                                                                        hover:bg-accent`}
                                                                        onClick={() => {
                                                                            if (isSelected) {
                                                                                form.setValue(
                                                                                    "name",
                                                                                    current.filter(v => v !== name)
                                                                                );
                                                                                setSelectedRoleIds(prev => prev.filter(id => id !== role.id));
                                                                            } else {
                                                                                form.setValue("name", [...current, name]);
                                                                                setSelectedRoleIds(prev => [...prev, role.id]);
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

    );
};

const AddRoleWrapper: React.FC<AddRoleFormProps> = (props) => {
    return (

        <RolesProvider>
            <AddRoleForm {...props} />
        </RolesProvider>

    );
};


export default AddRoleWrapper;