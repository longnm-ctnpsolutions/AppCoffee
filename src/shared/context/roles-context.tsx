"use client";

import * as React from 'react';
import type { Role } from '@/features/roles/types/role.types';
import type { TableState } from '@/types/odata.types';
import { getRolesWithOData, getRolesByFieldWithOData, type RolesQueryResult } from "@/shared/api/services/roles/roles-odata.service";
import {
    createRole,
    deleteRole,
    deleteMultipleRoles,
    updateRoleStatus,
    getRoleById,
    updateRole,
    type UpdateRoleData,
    getRoles,
} from '@/shared/api/services/roles/roles.service';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// State interface
interface RolesState {
    roles: Role[];
    selectedRole: Role | null;
    allRoles: Role[];
    isLoading: boolean;
    isActionLoading: boolean;
    isAllLoading: boolean;
    isDetailLoading: boolean;
    error: string | null;
    detailError: string | null;
    totalCount: number;
    hasMore: boolean;
    searchTerm: string;
}

// Actions
type RolesAction =
    | { type: 'FETCH_INIT'; }
    | { type: 'FETCH_SUCCESS'; payload: RolesQueryResult; }
    | { type: 'FETCH_FAILURE'; payload: string; }
    | { type: 'FETCH_ALL_INIT' }
    | { type: 'FETCH_ALL_SUCCESS'; payload: Role[] }        // thêm
    | { type: 'FETCH_ALL_FAILURE'; payload: string }
    | { type: 'ADD_SUCCESS'; payload: Role; }
    | { type: 'REMOVE_SUCCESS'; payload: { id: string; }; }
    | { type: 'REMOVE_MULTIPLE_SUCCESS'; payload: { ids: string[]; }; }
    | { type: 'SET_ACTION_LOADING'; payload: boolean; }
    | { type: 'SET_ERROR'; payload: string | null; }
    | { type: 'SET_SEARCH_TERM'; payload: string; }
    | { type: 'CLEAR_SEARCH'; }
    | { type: 'UPDATE_STATUS_SUCCESS'; payload: { role: Role; }; }
    | { type: 'UPDATE_ROLE_SUCCESS'; payload: { role: Role; }; }
    | { type: 'FETCH_DETAIL_INIT'; }
    | { type: 'FETCH_DETAIL_SUCCESS'; payload: Role; }
    | { type: 'FETCH_DETAIL_FAILURE'; payload: string; }
    | { type: 'CLEAR_SELECTED_ROLE'; };

// Reducer
const rolesReducer = (state: RolesState, action: RolesAction): RolesState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoading: true, error: null };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                roles: action.payload.roles,
                totalCount: action.payload.totalCount,
                hasMore: action.payload.hasMore
            };

        case 'FETCH_FAILURE':
            return { ...state, isLoading: false, error: action.payload };

        case 'ADD_SUCCESS':
            return {
                ...state,
                roles: [action.payload, ...state.roles],
                totalCount: state.totalCount + 1
            };

        case 'REMOVE_SUCCESS':
            return {
                ...state,
                roles: state.roles.filter(role => role.id !== action.payload.id),
                totalCount: state.totalCount - 1,
                isActionLoading: false,
                selectedRole: state.selectedRole?.id === action.payload.id ? null : state.selectedRole
            };

        case 'REMOVE_MULTIPLE_SUCCESS':
            return {
                ...state,
                roles: state.roles.filter(role => !action.payload.ids.includes(role.id)),
                totalCount: state.totalCount - action.payload.ids.length,
                isActionLoading: false,
                selectedRole: state.selectedRole && action.payload.ids.includes(state.selectedRole.id)
                    ? null
                    : state.selectedRole
            };

        case 'SET_ACTION_LOADING':
            return { ...state, isActionLoading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false, isActionLoading: false };

        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };

        case 'CLEAR_SEARCH':
            return { ...state, searchTerm: '' };

        case 'UPDATE_STATUS_SUCCESS':
            return {
                ...state,
                roles: state.roles.map(role =>
                    role.id === action.payload.role.id
                        ? action.payload.role
                        : role
                ),
                selectedRole: state.selectedRole?.id === action.payload.role.id
                    ? action.payload.role
                    : state.selectedRole,
                isActionLoading: false,
            };

        case 'UPDATE_ROLE_SUCCESS':
            return {
                ...state,
                roles: state.roles.map(role =>
                    role.id === action.payload.role.id
                        ? { ...role, ...action.payload.role }
                        : role
                ),
                selectedRole: state.selectedRole?.id === action.payload.role.id
                    ? { ...state.selectedRole, ...action.payload.role }
                    : state.selectedRole,
                isActionLoading: false,
            };

        // ✅ DETAIL ACTIONS - MỚI THÊM
        case 'FETCH_DETAIL_INIT':
            return {
                ...state,
                isDetailLoading: true,
                detailError: null
            };

        case 'FETCH_DETAIL_SUCCESS':
            return {
                ...state,
                isDetailLoading: false,
                selectedRole: action.payload,
                detailError: null
            };

        case 'FETCH_DETAIL_FAILURE':
            return {
                ...state,
                isDetailLoading: false,
                detailError: action.payload,
                selectedRole: null
            };

        case 'CLEAR_SELECTED_ROLE':
            return {
                ...state,
                selectedRole: null,
                detailError: null,
                isDetailLoading: false
            };

        case 'FETCH_ALL_INIT':
            return { ...state, isAllLoading: true, error: null };

        case 'FETCH_ALL_SUCCESS':
            return { ...state, isAllLoading: false, allRoles: action.payload };

        case 'FETCH_ALL_FAILURE':
            return { ...state, isAllLoading: false, error: action.payload };

        default:
            return state;
    }
};

// Initial state
const initialState: RolesState = {
    roles: [],
    selectedRole: null,
    allRoles: [],
    isAllLoading: false,
    isLoading: false,
    isActionLoading: false,
    isDetailLoading: false,
    error: null,
    detailError: null,
    totalCount: 0,
    hasMore: false,
    searchTerm: '',
};

// TÁCH RIÊNG STATE VÀ DISPATCH CONTEXTS
const RolesStateContext = React.createContext<RolesState | undefined>(undefined);
const RolesDispatchContext = React.createContext<React.Dispatch<RolesAction> | undefined>(undefined);

// Provider props
interface RolesProviderProps {
    children: React.ReactNode;
    debounceDelay?: number;
}

export const RolesProvider: React.FC<RolesProviderProps> = ({
    children,
    debounceDelay = 300
}) => {
    const [state, dispatch] = React.useReducer(rolesReducer, initialState);

    return (
        <RolesStateContext.Provider value={state}>
            <RolesDispatchContext.Provider value={dispatch}>
                {children}
            </RolesDispatchContext.Provider>
        </RolesStateContext.Provider>
    );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useRolesState = (): RolesState => {
    const context = React.useContext(RolesStateContext);
    if (context === undefined) {
        throw new Error('useRolesState must be used within a RolesProvider');
    }
    return context;
};

export const useRolesDispatch = (): React.Dispatch<RolesAction> => {
    const context = React.useContext(RolesDispatchContext);
    if (context === undefined) {
        throw new Error('useRolesDispatch must be used within a RolesProvider');
    }
    return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useRolesActions = (debounceDelay: number = 300) => {
  const state = useRolesState();
  const dispatch = useRolesDispatch();
  const { toast } = useToast();
  const router = useRouter();

    // ✅ Sử dụng refs để track state và prevent unnecessary calls
    const currentTableStateRef = React.useRef<TableState | null>(null);
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = React.useRef(false);
    const lastFetchParamsRef = React.useRef<string>('');

    // ✅ Stable fetch function với ref để prevent recreation
    const fetchRolesInternal = React.useCallback(async (tableState: TableState, searchQuery: string) => {
        // ✅ Prevent duplicate calls bằng cách compare parameters
        const currentParams = JSON.stringify({ tableState, searchQuery });
        if (lastFetchParamsRef.current === currentParams) {
            console.log('🚫 Duplicate API call prevented');
            return;
        }

        console.log('🔥 fetchRolesInternal called with:', { tableState, searchQuery });
        lastFetchParamsRef.current = currentParams;

        dispatch({ type: 'FETCH_INIT' });
        try {
            const result = await getRolesWithOData(tableState, searchQuery);
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

    const fetchRolesByField = React.useCallback(async (field: string, searchQuery: string) => {
        try {
            const result = await getRolesByFieldWithOData(field, searchQuery);
            return result;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, []);

    // ✅ Main fetch function - CHỈ update ref, KHÔNG trigger search effect
    const fetchRoles = React.useCallback(async (tableState: TableState) => {
        console.log('📋 fetchRoles called');

        // Clear existing timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // Update ref KHÔNG trigger re-render
        currentTableStateRef.current = tableState;

        // ✅ Call immediately cho non-search requests
        await fetchRolesInternal(tableState, state.searchTerm);
    }, [fetchRolesInternal, state.searchTerm]);

    // ✅ SINGLE useEffect cho debounced search - CHỈ handle search term changes
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
            fetchRolesInternal(currentTableStateRef.current!, state.searchTerm);
        }, debounceDelay);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [state.searchTerm, fetchRolesInternal, debounceDelay]);

    // ✅ Initialization effect - CHỈ chạy 1 lần
    React.useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            console.log('✅ RolesActions initialized');
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

    const fetchAllRoles = React.useCallback(async () => {
            dispatch({ type: 'FETCH_ALL_INIT' });
            try {
                const data = await getRoles();
                dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
            } catch (err) {
                dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
            }
    }, [fetchRolesInternal, dispatch]);

  // CRUD actions
  const addRole = React.useCallback(async (newRoleData: Omit<Role, 'id' | 'status'>) => {
    //dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const newRole = await createRole(newRoleData);
      await fetchAllRoles()
      dispatch({ type: 'ADD_SUCCESS', payload: newRole });
      //dispatch({ type: 'SET_ACTION_LOADING', payload: false });

      toast({
        title: "Success",
        description: "Role created successfully!",
        variant: "default",
      });

      router.push(`/en/roles/${newRole}`);
      return true;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to update';
      dispatch({ type: 'SET_ERROR', payload: message });

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      return false;
    }
  }, [dispatch]);

    const removeRole = React.useCallback(async (roleId: string) => {
        const originalState = { ...state };
        dispatch({ type: 'REMOVE_SUCCESS', payload: { id: roleId } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            await deleteRole(roleId);
            await fetchAllRoles()
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });
            return true;
        } catch (error) {
            dispatch({
                type: 'FETCH_SUCCESS', payload: {
                    roles: originalState.roles,
                    totalCount: originalState.totalCount,
                    hasMore: originalState.hasMore
                }
            });
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });
            return false;
        }
    }, [state, dispatch]);

    const removeMultipleRoles = React.useCallback(async (roleIds: string[]) => {
        const originalState = { ...state };
        dispatch({ type: 'REMOVE_MULTIPLE_SUCCESS', payload: { ids: roleIds } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            await deleteMultipleRoles(roleIds);
            await fetchAllRoles()
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });
            return true;
        } catch (error) {
            dispatch({
                type: 'FETCH_SUCCESS', payload: {
                    roles: originalState.roles,
                    totalCount: originalState.totalCount,
                    hasMore: originalState.hasMore
                }
            });
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });
            return false;
        }
    }, [state, dispatch]);

    const updateStatus = React.useCallback(async (roleId: string, newStatus: number) => {
        // ✅ Tìm role trong cả roles array VÀ selectedRole
        const originalRole =
            state.roles.find(role => role.id === roleId) ||
            (state.selectedRole?.id === roleId ? state.selectedRole : null);

        if (!originalRole) {
            dispatch({ type: 'SET_ERROR', payload: 'Role not found' });
            return false;
        }

        // Optimistic update - cập nhật UI ngay lập tức
        const optimisticRole: Role = {
            ...originalRole
        };

        dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { role: optimisticRole } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            // Call API
            const updatedRole = await updateRoleStatus(roleId, newStatus);

            // Update với data thật từ server
            dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { role: updatedRole } });
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });

      console.log('✅ Role status updated successfully:', updatedRole);

      toast({
        title: "Success",
        description: `Role details updated successfully!`,
        variant: "default",
      });

      return true;
    } catch (error: any) {
      // Rollback về trạng thái ban đầu
        dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { role: originalRole } });

        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        dispatch({ type: 'SET_ERROR', payload: message });

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      return false;
    }
  }, [state.roles, state.selectedRole, dispatch]); // ✅ Thêm state.selectedRole vào dependency


    // ✅ Thêm role detail actions
    const fetchRoleById = React.useCallback(async (roleId: string) => {
        dispatch({ type: 'FETCH_DETAIL_INIT' });

        try {
            const role = await getRoleById(roleId);
            dispatch({ type: 'FETCH_DETAIL_SUCCESS', payload: role });
            return role;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'FETCH_DETAIL_FAILURE', payload: message });
            throw error;
        }
    }, [dispatch]);

    const clearSelectedRole = React.useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTED_ROLE' });
    }, [dispatch]);

    // ✅ Get role from cache hoặc fetch
    const getRoleDetails = React.useCallback(async (roleId: string) => {
        // Kiểm tra xem role đã có trong cache chưa
        const cachedRole = state.roles.find(role => role.id === roleId);

        if (cachedRole) {
            // Nếu có trong cache, dùng luôn
            dispatch({ type: 'FETCH_DETAIL_SUCCESS', payload: cachedRole });
            return cachedRole;
        }

        // Nếu không có, fetch từ API
        return await fetchRoleById(roleId);
    }, [state.roles, fetchRoleById, dispatch]);

    // ✅ NEW: Update Role Action
    const updateRoleData = React.useCallback(async (roleId: string, updateData: Omit<UpdateRoleData, 'id'>) => {
        // ✅ Tìm role trong cả roles array VÀ selectedRole
        const originalRole =
            state.roles.find(role => role.id === roleId) ||
            (state.selectedRole?.id === roleId ? state.selectedRole : null);

        if (!originalRole) {
            dispatch({ type: 'SET_ERROR', payload: 'Role not found' });
            return false;
        }

        // Optimistic update - cập nhật UI ngay lập tức
        const optimisticRole: Role = {
            ...originalRole,
            ...updateData,
        };

        dispatch({ type: 'UPDATE_ROLE_SUCCESS', payload: { role: optimisticRole } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            // Call API với full UpdateRoleData
            const fullUpdateData: UpdateRoleData = {
                id: roleId,
                ...updateData,
            };

            const updatedRole = await updateRole(roleId, fullUpdateData);

            // Update với data thật từ server
            dispatch({ type: 'UPDATE_ROLE_SUCCESS', payload: { role: updatedRole } });
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });

            console.log('✅ Role updated successfully:', updatedRole);

            toast({
                title: "Success",
                description: "Role details updated successfully!",
                variant: "default",
            });
        } catch (error: any) {
            // Rollback về trạng thái ban đầu
            dispatch({ type: 'UPDATE_ROLE_SUCCESS', payload: { role: originalRole } });

            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });

            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });

            console.error('❌ Update role failed:', error);
        }
    }, [state.roles, state.selectedRole, dispatch]);

    return {
        // State (for easy access)
        ...state,

        // Search
        setSearchTerm,
        clearSearch,
        isSearching,

        // Actions
        fetchRolesByField,
        fetchRoles,
        fetchAllRoles,
        addRole,
        removeRole,
        removeMultipleRoles,
        updateStatus,
        updateRoleData,

        // ✅ Detail actions
        fetchRoleById,
        getRoleDetails,
        clearSelectedRole,
    };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useRolesData = () => {
    const state = useRolesState();

    return {
        roles: state.roles,
        isLoading: state.isLoading,
        allRoles: state.allRoles,
        isAllLoading: state.isAllLoading,
        isActionLoading: state.isActionLoading,
        error: state.error,
        totalCount: state.totalCount,
        hasMore: state.hasMore,
        searchTerm: state.searchTerm,
        isSearching: state.searchTerm.trim().length > 0,
    };
};

export const useRoleDetail = () => {
    const state = useRolesState();

    return {
        selectedRole: state.selectedRole,
        isDetailLoading: state.isDetailLoading,
        detailError: state.detailError,
    };
};
