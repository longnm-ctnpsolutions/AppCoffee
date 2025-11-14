"use client";

import * as React from 'react';
import type { Permission } from '@/types/permissions.types';
import type { TableState } from '@/types/odata.types';
import { getRolePermissionsWithOData, type RolePermissionsQueryResult } from "@/shared/api/services/roles/roles-odata.service";
import { deleteRolePermissionId, addRolePermission } from "@/shared/api/services/permissions/permissions.service";
import { getRolePermission } from "@/services/permissions/permissions.service"

interface RolePermissionsState {
  rolePermissions: Permission[];
  isLoading: boolean;
  allPermissions: Permission[];
  isActionLoading: boolean;
  isAllLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  searchTerm: string;
  selectedRolePermission: Permission | null;
}

type RolePermissionsAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: RolePermissionsQueryResult }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'FETCH_ALL_INIT' }
  | { type: 'FETCH_ALL_SUCCESS'; payload: Permission[] }        // thêm
  | { type: 'FETCH_ALL_FAILURE'; payload: string }
  | { type: 'ADD_SUCCESS'; payload: Permission }
  | { type: 'ADD_MANY_SUCCESS'; payload: { ids: string[] } }
  | { type: 'REMOVE_SUCCESS'; payload: { id: string } }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'CLEAR_SELECTED_ROLE' };


const rolePermissionsReducer = (state: RolePermissionsState, action: RolePermissionsAction): RolePermissionsState => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        rolePermissions: action.payload.rolePermissions,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore
      };

    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'ADD_SUCCESS':
      return {
        ...state,
        rolePermissions: [action.payload, ...state.rolePermissions],
        totalCount: state.totalCount + 1
      };

    case "ADD_MANY_SUCCESS":
      return {
        ...state,
        rolePermissions: state.rolePermissions.filter(
          p => !action.payload.ids.includes(p.id)
        ),
        totalCount: state.totalCount + action.payload.ids.length,
        isActionLoading: false,
        selectedRolePermission: state.selectedRolePermission && action.payload.ids.includes(state.selectedRolePermission.id)
          ? null
          : state.selectedRolePermission
      };

    case 'REMOVE_SUCCESS':
      return {
        ...state,
        rolePermissions: state.rolePermissions.filter(rolePermissions => rolePermissions.id !== action.payload.id),
        totalCount: state.totalCount - 1,
        isActionLoading: false,
        selectedRolePermission: state.selectedRolePermission?.id === action.payload.id ? null : state.selectedRolePermission
      };

    case 'SET_ACTION_LOADING':
      return { ...state, isActionLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isActionLoading: false };

    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };

    case 'CLEAR_SEARCH':
      return { ...state, searchTerm: '' };

    case 'FETCH_ALL_INIT':
      return { ...state, isAllLoading: true, error: null };

    case 'FETCH_ALL_SUCCESS':
      return { ...state, isAllLoading: false, allPermissions: action.payload };

    case 'FETCH_ALL_FAILURE':
      return { ...state, isAllLoading: false, error: action.payload };

    default:
      return state;
  }
};

// Initial state
const initialState: RolePermissionsState = {
  rolePermissions: [],
  selectedRolePermission: null,
  allPermissions: [],
  isAllLoading: false,
  isLoading: false,
  isActionLoading: false,
  error: null,
  totalCount: 0,
  hasMore: false,
  searchTerm: '',
};

const RolePermissionsStateContext = React.createContext<RolePermissionsState | undefined>(undefined);
const RolePermissionsDispatchContext = React.createContext<React.Dispatch<RolePermissionsAction> | undefined>(undefined);


interface RolePermissionsProviderProps {
  children: React.ReactNode;
  debounceDelay?: number;
}

export const RolePermissionsProvider: React.FC<RolePermissionsProviderProps> = ({
  children
}) => {
  const [state, dispatch] = React.useReducer(rolePermissionsReducer, initialState);

  return (
    <RolePermissionsStateContext.Provider value={state}>
      <RolePermissionsDispatchContext.Provider value={dispatch}>
        {children}
      </RolePermissionsDispatchContext.Provider>
    </RolePermissionsStateContext.Provider>
  );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useRolePermissionsState = (): RolePermissionsState => {
  const context = React.useContext(RolePermissionsStateContext);
  if (context === undefined) {
    throw new Error('useRolePermissionsState must be used within a RolePermissionsProvider');
  }
  return context;
};

export const useRolePermissionsDispatch = (): React.Dispatch<RolePermissionsAction> => {
  const context = React.useContext(RolePermissionsDispatchContext);
  if (context === undefined) {
    throw new Error('useRolePermissionsDispatch must be used within a RolePermissionsProvider');
  }
  return context;
};

export const useRolePermissionsStateActions = (roleId: string, debounceDelay: number = 300) => {
  const state = useRolePermissionsState();
  const dispatch = useRolePermissionsDispatch();

  // Refs để track state và prevent unnecessary calls
  const currentTableStateRef = React.useRef<TableState | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = React.useRef(false);
  const lastFetchParamsRef = React.useRef<string>('');

  // Stable fetch function với ref để prevent recreation
  const fetchRolePermissionsInternal = React.useCallback(async (roleId: string, tableState: TableState, searchQuery: string) => {
    // Prevent duplicate calls bằng cách compare parameters
    const currentParams = JSON.stringify({ tableState, searchQuery });
    if (lastFetchParamsRef.current === currentParams) {
      console.log('🚫 Duplicate API call prevented');
      return;
    }

    console.log('🔥 fetchRolePermissionsInternal called with:', { roleId, tableState, searchQuery });
    lastFetchParamsRef.current = currentParams;

    dispatch({ type: 'FETCH_INIT' });
    try {
      const result = await getRolePermissionsWithOData(roleId, tableState, searchQuery);
      dispatch({ type: 'FETCH_SUCCESS', payload: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'FETCH_FAILURE', payload: message });
    } finally {
      // Reset after a short delay để allow cho next legitimate call
      setTimeout(() => {
        lastFetchParamsRef.current = '';
      }, 100);
    }
  }, [dispatch]);

  // Main fetch function - CHỈ update ref, KHÔNG trigger search effect
  const fetchRolePermissions = React.useCallback(async (roleId: string, tableState: TableState) => {
    console.log('📋 fetchPermissions role called');

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Update ref KHÔNG trigger re-render
    currentTableStateRef.current = tableState;

    // Call immediately cho non-search requests
    await fetchRolePermissionsInternal(roleId, tableState, state.searchTerm);
  }, [fetchRolePermissionsInternal, state.searchTerm]);

  // Main fetch function - CHỈ update ref, KHÔNG trigger search effect

  const fetchAllRolePermissions = React.useCallback(async () => {
    dispatch({ type: 'FETCH_ALL_INIT' });
    try {
      const data = await getRolePermission(roleId);
      dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
    }
  }, [fetchRolePermissionsInternal, dispatch]);


  const addRolePermissionAction = React.useCallback(
    async (permissionIds: string[]) => {
      console.log("➕ Adding permissions:", permissionIds);
      dispatch({ type: "SET_ACTION_LOADING", payload: true });

      try {
        await addRolePermission(roleId, permissionIds);
        await fetchAllRolePermissions();
        dispatch({
          type: "ADD_MANY_SUCCESS",
          payload: { ids: permissionIds }
        });
        dispatch({ type: "SET_ACTION_LOADING", payload: false });

        if (currentTableStateRef.current) {
          await fetchRolePermissionsInternal(roleId, currentTableStateRef.current, state.searchTerm);
        }

        console.log("✅ Permissions added successfully");

        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add permissions";
        dispatch({ type: "SET_ERROR", payload: message });
        console.error("❌ Add permissions failed:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_ACTION_LOADING", payload: false });
      }
    },
    [roleId, dispatch, fetchRolePermissionsInternal, state.searchTerm]
  );


  const deleteRolePermissionAction = React.useCallback(
    async (roleId: string, permissionId: string) => {
      console.log("🗑️ Deleting permission:", permissionId);
      dispatch({ type: "SET_ACTION_LOADING", payload: true });

      try {
        await deleteRolePermissionId(roleId, permissionId);
        await fetchAllRolePermissions();
        dispatch({ type: "REMOVE_SUCCESS", payload: { id: permissionId } });
        console.log("✅ Permission role deleted successfully:", permissionId);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete permission";
        dispatch({ type: "SET_ERROR", payload: message });
        console.error("❌ Delete permission failed:", error);
        throw error;
      } finally {
        dispatch({ type: "SET_ACTION_LOADING", payload: false });
      }
    },
    [dispatch]
  );


  // SINGLE useEffect cho debounced search - CHỈ handle search term changes
  React.useEffect(() => {
    // Skip nếu chưa có table state hoặc chưa initialized
    if (!currentTableStateRef.current || !isInitializedRef.current) return;

    console.log('🔍 Search term changed, setting up debounce:', state.searchTerm);

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set up debounced search
    fetchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 Debounced search triggered:', state.searchTerm);
      fetchRolePermissionsInternal(roleId, currentTableStateRef.current!, state.searchTerm);
    }, debounceDelay);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [state.searchTerm, fetchRolePermissionsInternal, debounceDelay, roleId]);

  // Initialization effect - CHỈ chạy 1 lần
  React.useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('✅ PermissionsActions initialized');
    }
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Search actions
  const setSearchTerm = React.useCallback((term: string) => {
    console.log('🔍 Setting search term:', term);
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, [dispatch]);

  const clearSearch = React.useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, [dispatch]);

  const isSearching = React.useMemo(() => {
    return state.searchTerm.trim().length > 0;
  }, [state.searchTerm]);



  return {
    // State (for easy access)
    ...state,

    // Search
    setSearchTerm,
    clearSearch,
    isSearching,

    // Actions
    fetchRolePermissions,
    fetchAllRolePermissions,
    addRolePermissionAction,

    deleteRolePermissionAction
  };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const usePermissionsData = () => {
  const state = useRolePermissionsState();

  return {
    rolePermissions: state.rolePermissions,
    allPermissions: state.allPermissions,
    isAllLoading: state.isAllLoading,
    isLoading: state.isLoading,
    isActionLoading: state.isActionLoading,
    error: state.error,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    searchTerm: state.searchTerm,
    isSearching: state.searchTerm.trim().length > 0,
  };
};
