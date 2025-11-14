"use client";

import * as React from "react";
import { MoreVertical, ChevronDown } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent
} from "@/shared/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Label } from "@/shared/components/ui/label";

import { useResponsiveActions, ActionItem } from '@/shared/hooks/use-responsive-actions';

import { ConfirmationDialog } from "@/shared/components/custom-ui/table/confirmation-dialog";

interface ActionBarProps {
    actions: ActionItem[];
    containerWidth?: number;
    isSidebarExpanded?: boolean;
    enableDropdown?: boolean;
    dropdownThreshold?: number;
    dropdownTriggerIcon?: React.ComponentType<{ className?: string; }>;
    dropdownAlign?: 'start' | 'center' | 'end';
    className?: string;
    spacing?: 'sm' | 'md' | 'lg';
}

// Action renderer components
const ActionButton: React.FC<{ action: ActionItem; }> = ({ action }) => {
    const Icon = action.icon;

    if (action.type === 'custom' && action.component) {
        return <>{action.component}</>;
    }

    return (
        <Button
            variant={action.variant || 'outline'}
            size={action.size || 'default'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={action.size === 'icon' ? '' : undefined}
        >
            {Icon && <Icon className={action.size === 'icon' ? 'h-4 w-4' : 'mr-2 h-4 w-4'} />}
            {action.size !== 'icon' && action.label}
        </Button>
    );
};

const ActionDropdown: React.FC<{ action: ActionItem; }> = ({ action }) => {
    const Icon = action.icon;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={action.variant || 'ghost'} size={action.size || 'default'}>
                    {Icon && <Icon className="h-4 w-4" />}
                    {action.size !== 'icon' && (
                        <>
                            {action.label && <span className="ml-2">{action.label}</span>}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {action.children?.map((child, index) => (
                    <DropdownMenuItem key={`${child.id}-${index}`} onClick={child.onClick}>
                        {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                        <span>{child.label}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const ActionDialog: React.FC<{ action: ActionItem; }> = ({ action }) => {
    const Icon = action.icon;

    return (
        <ConfirmationDialog
            key={action.id}
            title={action.dialog?.title || `Confirm`}
            description={
                <div className="max-w-[400px] whitespace-normal break-words">
                    {action.dialog?.description ||
                        (Array.isArray(action.value)
                            ? (
                                action.value.length === 1 ? (
                                    <>Are you sure you want to delete this: <b>{action.value[0].name || action.value[0].email}</b>?</>
                                ) : (
                                    <>Are you sure you want to delete these:{" "}
                                        {action.value.map((c: any, i: number) => (
                                            <React.Fragment key={c.id}>
                                                <b>{c.name || c.email}</b>
                                                {i < action.value.length - 1 && ", "}
                                            </React.Fragment>
                                        ))}?
                                    </>
                                )
                            )
                            : (
                                <>Are you sure you want to delete this: <b>{String(action.value).toLowerCase()}</b>?</>
                            )
                        )
                    }
                </div>
            }
            actionLabel={action.dialog?.actionLabel || action.label}
            variant={action.variant}
            onConfirm={action.onClick!}
            trigger={
                <Button
                    variant={action.variant === "destructive" ? "destructive" : "default"}
                    disabled={action.disabled}
                >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                </Button>
            }
        />
    );
};

// Render action based on type
const renderAction = (action: ActionItem, key: string) => {
    switch (action.type) {
        case 'dropdown':
            return <ActionDropdown key={key} action={action} />;
        case 'dialog':
            return <ActionDialog key={key} action={action} />;
        case 'custom':
            return <ActionButton key={key} action={action} />;
        default:
            return <ActionButton key={key} action={action} />;
    }
};

// Render dropdown menu item
const renderDropdownItem = (action: ActionItem, key: string) => {
    const Icon = action.icon;

    if (action.type === 'dropdown' && action.children) {
        return (
            <DropdownMenuSub key={key}>
                <DropdownMenuSubTrigger>
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <span>{action.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                    {action.children.map((child, index) => (
                        <DropdownMenuItem key={`${child.id}-${index}`} onClick={child.onClick}>
                            {child.icon && <child.icon className="mr-2 h-4 w-4" />}
                            <span>{child.label}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    }

    if (action.type === 'dialog') {
        return (
            <ConfirmationDialog
                key={action.id}
                title={action.dialog?.title || `Confirm`}
                description={
                    <div className="max-w-[400px] whitespace-normal break-words">
                        {action.dialog?.description ||
                            (Array.isArray(action.value)
                                ? (
                                    action.value.length === 1 ? (
                                        <>Are you sure you want to delete this: <b>{action.value[0].name || action.value[0].email}</b>?</>
                                    ) : (
                                        <>Are you sure you want to delete these:{" "}
                                            {action.value.map((c: any, i: number) => (
                                                <React.Fragment key={c.id}>
                                                    <b>{c.name || c.email}</b>
                                                    {i < action.value.length - 1 && ", "}
                                                </React.Fragment>
                                            ))}?
                                        </>
                                    )
                                )
                                : (
                                    <>Are you sure you want to delete this: <b>{String(action.value).toLowerCase()}</b>?</>
                                )
                            )
                        }
                    </div>
                }
                actionLabel={action.dialog?.actionLabel || action.label}
                variant={action.variant}
                onConfirm={action.onClick!}
                trigger={
                    <Button
                        variant={action.variant === "destructive" ? "destructive" : "default"}
                        disabled={action.disabled}
                    >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {action.label}
                    </Button>
                }
            />
        );
    }


    return (
        <DropdownMenuItem key={key} onClick={action.onClick} disabled={action.disabled}>
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            <span>{action.label}</span>
        </DropdownMenuItem>
    );
};

export const ActionBar: React.FC<ActionBarProps> = ({
    actions,
    containerWidth,
    isSidebarExpanded = false,
    enableDropdown = true,
    dropdownThreshold = 1,
    dropdownTriggerIcon: DropdownIcon = MoreVertical,
    dropdownAlign = 'end',
    className = '',
    spacing = 'md'
}) => {
    const { visibleActions, hiddenActions, shouldShowDropdown } = useResponsiveActions({
        actions,
        containerWidth,
        isSidebarExpanded,
        enableDropdown,
        dropdownThreshold
    });

    const spacingClasses = {
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3'
    };

    return (
        <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
            {/* Visible Actions */}
            {visibleActions.map((action) =>
                renderAction(action, `visible-${action.id}`)
            )}

            {/* Responsive Dropdown */}
            {shouldShowDropdown && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <DropdownIcon className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={dropdownAlign} className="w-48">
                        {hiddenActions.map((action) =>
                            renderDropdownItem(action, `hidden-${action.id}`)
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};

export default ActionBar;
