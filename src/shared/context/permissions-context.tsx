"use client";

import * as React from 'react';
import type { Permission } from '@/types/permissions.types';
import type { TableState } from '@/types/odata.types';
import { getPermissionsWithOData, searchClientPermissionByFieldWithOData, type PermissionsQueryResult } from "@/shared/api/services/permissions/permissions-odata.service";
import { addPermission, deletePermissionId, deleteRolePermissionId, addRolePermission, getPermission, importPermission, } from "@/shared/api/services/permissions/permissions.service";
import { useToast } from "@/hooks/use-toast";


interface AddPermissionRequest {
    name: string;
    description: string;
}

interface PermissionsState {
    permissions: Permission[];
    allPermissions: Permission[];
    isLoading: boolean;
    isActionLoading: boolean;
    isAllLoading: boolean;
    error: string | null;
    totalCount: number;
    hasMore: boolean;
    searchTerm: string;
    selectedPermission: Permission | null;
}

type PermissionsAction =
    | { type: 'FETCH_INIT'; }
    | { type: 'FETCH_SUCCESS'; payload: PermissionsQueryResult; }
    | { type: 'FETCH_FAILURE'; payload: string; }
    | { type: 'FETCH_ALL_INIT' }
    | { type: 'FETCH_ALL_SUCCESS'; payload: Permission[] }
    | { type: 'FETCH_ALL_FAILURE'; payload: string }
    | { type: 'ADD_SUCCESS'; payload: Permission; }
    | { type: 'ADD_SUCCESS_MANY'; payload: Permission[]; }
    | { type: 'ADD_MANY_SUCCESS'; payload: { ids: string[]; }; }
    | { type: 'REMOVE_SUCCESS'; payload: { id: string; }; }
    | { type: 'SET_ACTION_LOADING'; payload: boolean; }
    | { type: 'SET_ERROR'; payload: string | null; }
    | { type: 'SET_SEARCH_TERM'; payload: string; }
    | { type: 'CLEAR_SEARCH'; }
    | { type: 'CLEAR_SELECTED_CLIENT'; };


const permissionsReducer = (state: PermissionsState, action: PermissionsAction): PermissionsState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoading: true, error: null };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                permissions: action.payload.permissions,
                totalCount: action.payload.totalCount,
                hasMore: action.payload.hasMore
            };

        case 'FETCH_FAILURE':
            return { ...state, isLoading: false, error: action.payload };

        case 'ADD_SUCCESS':
            return {
                ...state,
                permissions: [action.payload, ...state.permissions],
                totalCount: state.totalCount + 1
            };

        case "ADD_MANY_SUCCESS":
            return {
                ...state,
                // filter bỏ những id vừa thêm nếu muốn
                permissions: state.permissions.filter(
                    p => !action.payload.ids.includes(p.id)
                ),
                totalCount: state.totalCount + action.payload.ids.length,
                isActionLoading: false,
                selectedPermission: state.selectedPermission && action.payload.ids.includes(state.selectedPermission.id)
                    ? null
                    : state.selectedPermission
            };

        case 'ADD_SUCCESS_MANY':
            return {
                ...state,
                permissions: [...action.payload, ...state.permissions],
                totalCount: state.totalCount + action.payload.length,
                isActionLoading: false
            };

        case 'REMOVE_SUCCESS':
            return {
                ...state,
                permissions: state.permissions.filter(permission => permission.id !== action.payload.id),
                totalCount: state.totalCount - 1,
                isActionLoading: false,
                selectedPermission: state.selectedPermission?.id === action.payload.id ? null : state.selectedPermission
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
const initialState: PermissionsState = {
    permissions: [],
    allPermissions: [],
    isAllLoading: false,
    selectedPermission: null,
    isLoading: false,
    isActionLoading: false,
    error: null,
    totalCount: 0,
    hasMore: false,
    searchTerm: '',
};

const PermissionsStateContext = React.createContext<PermissionsState | undefined>(undefined);
const PermissionsDispatchContext = React.createContext<React.Dispatch<PermissionsAction> | undefined>(undefined);


interface PermisionsProviderProps {
    children: React.ReactNode;
    debounceDelay?: number;
}

export const PermissionsProvider: React.FC<PermisionsProviderProps> = ({
    children
}) => {
    const [state, dispatch] = React.useReducer(permissionsReducer, initialState);

    return (
        <PermissionsStateContext.Provider value={state}>
            <PermissionsDispatchContext.Provider value={dispatch}>
                {children}
            </PermissionsDispatchContext.Provider>
        </PermissionsStateContext.Provider>
    );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const usePermissionsState = (): PermissionsState => {
    const context = React.useContext(PermissionsStateContext);
    if (context === undefined) {
        throw new Error('usePermissionsState must be used within a PermissionsProvider');
    }
    return context;
};

export const usePermissionsDispatch = (): React.Dispatch<PermissionsAction> => {
    const context = React.useContext(PermissionsDispatchContext);
    if (context === undefined) {
        throw new Error('usePermissionsDispatch must be used within a PermissionsProvider');
    }
    return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const usePermissionsStateActions = (clientId: string, debounceDelay: number = 300) => {
    const state = usePermissionsState();
    const dispatch = usePermissionsDispatch();
    const { toast } = useToast();

    // Refs để track state và prevent unnecessary calls
    const currentTableStateRef = React.useRef<TableState | null>(null);
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = React.useRef(false);
    const lastFetchParamsRef = React.useRef<string>('');

    // Stable fetch function với ref để prevent recreation
    const fetchPermissionsInternal = React.useCallback(async (clientId: string, tableState: TableState, searchQuery: string) => {
        // Prevent duplicate calls bằng cách compare parameters
        const currentParams = JSON.stringify({ tableState, searchQuery });
        if (lastFetchParamsRef.current === currentParams) {
            console.log('🚫 Duplicate API call prevented');
            return;
        }

        console.log('🔥 fetchPermissionsInternal called with:', { clientId, tableState, searchQuery });
        lastFetchParamsRef.current = currentParams;

        dispatch({ type: 'FETCH_INIT' });
        try {
            const result = await getPermissionsWithOData(clientId, tableState, searchQuery);
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
    const fetchPermissions = React.useCallback(async (clientId: string, tableState: TableState) => {
        console.log('📋 fetchPermissions called');

        // Clear existing timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // Update ref KHÔNG trigger re-render
        currentTableStateRef.current = tableState;

        // Call immediately cho non-search requests
        await fetchPermissionsInternal(clientId, tableState, state.searchTerm);
    }, [fetchPermissionsInternal, state.searchTerm]);

    // Main fetch function - CHỈ update ref, KHÔNG trigger search effect

    const searchClientPermissionsByField = React.useCallback(async (field: string, searchQuery: string, clientId: string) => {
        try {
            const result = await searchClientPermissionByFieldWithOData(field, searchQuery, clientId);
            return result;
        } catch (error) {
            console.error(error);
            return null;
        }
    }, []);

    const fetchAllPermissions = React.useCallback(async (clientId: string) => {
        dispatch({ type: 'FETCH_ALL_INIT' });
        try {
            const data = await getPermission(clientId);
            dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
        } catch (err) {
            dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
        }
    }, [fetchPermissionsInternal, dispatch]);

    const addPermissionAction = React.useCallback(async (permissionData: AddPermissionRequest) => {
        console.log('➕ Adding permission:', permissionData);
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            const newPermission = await addPermission(clientId, permissionData);
            dispatch({ type: 'ADD_SUCCESS', payload: newPermission });
            console.log('✅ Permission added successfully:', newPermission);

            // ✅ ADDED: Refresh table after successful add
            if (currentTableStateRef.current) {
                await fetchPermissionsInternal(clientId, currentTableStateRef.current, state.searchTerm);
            }

            return newPermission;
        } catch (error: any) {
            const message = error instanceof Error ? error.message : 'Failed to add permission';
            dispatch({ type: 'SET_ERROR', payload: message });

            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
            throw error;
        } finally {
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });
        }
    }, [clientId, dispatch, fetchPermissionsInternal, state.searchTerm]);

    const importPermissionAction = React.useCallback(
        async (file: File) => {
            console.log("📦 Uploading Excel file:", file.name);
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                // Gọi API gửi file
                const responseMessage = await importPermission(clientId, file);

                console.log("✅ Permissions imported successfully:", responseMessage);

                // 🔄 Refresh lại bảng
                if (currentTableStateRef.current) {
                    await fetchPermissionsInternal(clientId, currentTableStateRef.current, state.searchTerm);
                }

                toast({
                    title: "Success",
                    description: "Import permissions successfully!",
                    variant: "default",
                });

                return responseMessage;
            } catch (error: any) {
                const message = error instanceof Error ? error.message : "Failed to import permissions";
                dispatch({ type: "SET_ERROR", payload: message });
                if (currentTableStateRef.current) {
                    await fetchPermissionsInternal(clientId, currentTableStateRef.current, state.searchTerm);
                }
                //  toast({
                //     title: 'Error',
                //     description: message,
                //     variant: 'destructive',
                // });
                throw error;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [clientId, dispatch, fetchPermissionsInternal, state.searchTerm]
    );



    // ✅ DELETE PERMISSION ACTION
    const deletePermissionAction = React.useCallback(async (permissionId: string) => {
        console.log('🗑️ Deleting permission:', permissionId);
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            await deletePermissionId(clientId, permissionId);
            dispatch({ type: 'REMOVE_SUCCESS', payload: { id: permissionId } });

            toast({
                title: "Success",
                description: "Permission deleted successfully!",
                variant: "default",
            });
            console.log('✅ Permission deleted successfully:', permissionId);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete permission';
            dispatch({ type: 'SET_ERROR', payload: message });
            console.error('❌ Delete permission failed:', error);
            throw error;
        } finally {
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });
        }
    }, [clientId, dispatch]);

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
            fetchPermissionsInternal(clientId, currentTableStateRef.current!, state.searchTerm);
        }, debounceDelay);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [state.searchTerm, fetchPermissionsInternal, debounceDelay]);

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
        searchClientPermissionsByField,

        // Actions
        fetchPermissions,
        fetchAllPermissions,
        addPermissionAction,
        importPermissionAction,
        deletePermissionAction,

    };
};


// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const usePermissionsData = () => {
    const state = usePermissionsState();

    return {
        permissions: state.permissions,
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
