import { useState, useEffect, useMemo } from 'react'
import { useIsomorphicLayoutEffect } from '@/shared/hooks/use-isomorphic-layout-effect'

export interface ResponsiveBreakpoint {
  minWidth: number
  condition?: (options: { isSidebarExpanded?: boolean; windowWidth: number }) => boolean
}

export interface ActionItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  hideAt?: ResponsiveBreakpoint
  priority?: number // Lower number = higher priority (shown first)
  type?: 'button' | 'dropdown' | 'dialog' | 'custom'
  children?: ActionItem[] // For dropdown menus
  component?: React.ReactNode // For custom components
}

interface UseResponsiveActionsOptions {
  actions: ActionItem[]
  containerWidth?: number
  isSidebarExpanded?: boolean
  enableDropdown?: boolean
  dropdownThreshold?: number // Minimum actions to show dropdown
}

interface UseResponsiveActionsReturn {
  visibleActions: ActionItem[]
  hiddenActions: ActionItem[]
  shouldShowDropdown: boolean
  windowWidth: number
}

export const useResponsiveActions = ({
  actions,
  containerWidth,
  isSidebarExpanded = false,
  enableDropdown = true,
  dropdownThreshold = 1
}: UseResponsiveActionsOptions): UseResponsiveActionsReturn => {
  const [windowWidth, setWindowWidth] = useState(1400)
  const [isClient, setIsClient] = useState(false)

  // Track if we're on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useIsomorphicLayoutEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth)
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const { visibleActions, hiddenActions } = useMemo(() => {
    // On server or before hydration, show all actions to avoid hydration mismatch
    if (!isClient) {
      return { 
        visibleActions: actions, 
        hiddenActions: [] as ActionItem[]
      }
    }

    const effectiveWidth = containerWidth || windowWidth
    const context = { isSidebarExpanded, windowWidth: effectiveWidth }

    // Sort actions by priority
    const sortedActions = [...actions].sort((a, b) => (a.priority || 999) - (b.priority || 999))

    const visible: ActionItem[] = []
    const hidden: ActionItem[] = []

    sortedActions.forEach(action => {
      if (action.hideAt) {
        const shouldHideByWidth = effectiveWidth < action.hideAt.minWidth
        const shouldHideByCondition = action.hideAt.condition 
          ? action.hideAt.condition(context)
          : false
        
        const shouldHide = shouldHideByWidth || shouldHideByCondition
        
        if (shouldHide) {
          hidden.push(action)
        } else {
          visible.push(action)
        }
      } else {
        visible.push(action)
      }
    })

    return { visibleActions: visible, hiddenActions: hidden }
  }, [actions, windowWidth, containerWidth, isSidebarExpanded, isClient])

  const shouldShowDropdown = enableDropdown && hiddenActions.length >= dropdownThreshold

  return {
    visibleActions,
    hiddenActions,
    shouldShowDropdown,
    windowWidth
  }
}