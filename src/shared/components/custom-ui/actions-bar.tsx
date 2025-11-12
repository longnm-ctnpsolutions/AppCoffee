"use client"

import * as React from "react"
import { MoreVertical, ChevronDown } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
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
} from "@/shared/components/ui/alert-dialog"

import { useResponsiveActions, ActionItem } from '@/shared/components/custom-ui/hooks/use-responsive-actions'

interface ActionBarProps {
  actions: ActionItem[]
  containerWidth?: number
  isSidebarExpanded?: boolean
  enableDropdown?: boolean
  dropdownThreshold?: number
  dropdownTriggerIcon?: React.ComponentType<{ className?: string }>
  dropdownAlign?: 'start' | 'center' | 'end'
  className?: string
  spacing?: 'sm' | 'md' | 'lg'
}

// Action renderer components
const ActionButton: React.FC<{ action: ActionItem }> = ({ action }) => {
  const Icon = action.icon
  
  if (action.type === 'custom' && action.component) {
    return <>{action.component}</>
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
  )
}

const ActionDropdown: React.FC<{ action: ActionItem }> = ({ action }) => {
  const Icon = action.icon

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
        {action.children?.map((child, index) => renderDropdownItem(child, `${child.id}-${index}`))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ActionDialog: React.FC<{ action: ActionItem }> = ({ action }) => {
  const Icon = action.icon

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={action.variant || 'outline'}
          size={action.size || 'default'}
          disabled={action.disabled}
        >
          {Icon && <Icon className={action.size === 'icon' ? 'h-4 w-4' : 'mr-2 h-4 w-4'} />}
          {action.size !== 'icon' && action.label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Action</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action.label.toLowerCase()}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={action.onClick}
            className={action.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Render action based on type
const renderAction = (action: ActionItem, key: string) => {
  switch (action.type) {
    case 'dropdown':
      return <ActionDropdown key={key} action={action} />
    case 'dialog':
      return <ActionDialog key={key} action={action} />
    case 'custom':
      return <div key={key}>{action.component}</div>
    default:
      return <ActionButton key={key} action={action} />
  }
}

// Render dropdown menu item
const renderDropdownItem = (action: ActionItem, key: string) => {
  const Icon = action.icon

  if (action.type === 'custom' && action.component) {
    return <React.Fragment key={key}>{action.component}</React.Fragment>
  }

  if (action.type === 'dropdown' && action.children) {
    return (
      <DropdownMenuSub key={key}>
        <DropdownMenuSubTrigger>
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          <span>{action.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {action.children.map((child, index) => (
            renderDropdownItem(child, `${child.id}-${index}`)
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    )
  }

  if (action.type === 'dialog') {
    return (
      <DropdownMenuItem key={key} onSelect={(e) => e.preventDefault()}>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className="flex items-center w-full cursor-pointer">
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              <span>{action.label}</span>
            </div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Action</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {action.label.toLowerCase()}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={action.onClick}
                className={action.variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuItem>
    )
  }

  return (
    <DropdownMenuItem key={key} onClick={action.onClick} disabled={action.disabled}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      <span>{action.label}</span>
    </DropdownMenuItem>
  )
}

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
  })

  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3'
  }

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
      {visibleActions.map((action) => 
        renderAction(action, `visible-${action.id}`)
      )}

      {shouldShowDropdown && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <DropdownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={dropdownAlign} className="w-56">
            {hiddenActions.map((action) => 
              renderDropdownItem(action, `hidden-${action.id}`)
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export default ActionBar
