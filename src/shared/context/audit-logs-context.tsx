"use client";

import * as React from 'react';
import type { AuditLog } from '@/features/audit-logs/types/audit-log.types';
import type { TableState } from '@/types/odata.types';
import { getAuditLogsMeWithOData, getAuditLogsWithOData, type AuditLogsQueryResult } from "@/shared/api/services/audit-logs/audit-logs-odata.service";
import {
    getAuditLogById,
    getAuditLogs,
    getAuditLogsMe
} from '@/shared/api/services/audit-logs/audit-logs.service';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAuthState, usePermissions } from './auth-context';
import { CORE_PERMISSIONS } from '../types/auth.types';

// State interface
interface AuditLogsState {
    auditLogs: AuditLog[];
    selectedAuditLog: AuditLog | null;
    allAuditLogs: AuditLog[];
    isLoading: boolean;
    isAllLoading: boolean;
    isActionLoading: boolean;
    isDetailLoading: boolean;
    error: string | null;
    detailError: string | null;
    totalCount: number;
    hasMore: boolean;
    searchTerm: string;
}

// Actions
type AuditLogsAction =
    | { type: 'FETCH_INIT'; }
    | { type: 'FETCH_SUCCESS'; payload: AuditLogsQueryResult }
    | { type: 'FETCH_FAILURE'; payload: string; }
    | { type: 'FETCH_ALL_INIT'; }
    | { type: 'FETCH_ALL_SUCCESS'; payload: AuditLog[]; }        // thêm
    | { type: 'FETCH_ALL_FAILURE'; payload: string; }
    | { type: 'ADD_SUCCESS'; payload: AuditLog; }
    | { type: 'REMOVE_SUCCESS'; payload: { id: string; }; }
    | { type: 'REMOVE_MULTIPLE_SUCCESS'; payload: { ids: string[]; }; }
    | { type: 'SET_ACTION_LOADING'; payload: boolean; }
    | { type: 'SET_ERROR'; payload: string | null; }
    | { type: 'SET_SEARCH_TERM'; payload: string; }
    | { type: 'CLEAR_SEARCH'; }
    | { type: 'UPDATE_STATUS_SUCCESS'; payload: { auditLog: AuditLog; }; }
    | { type: 'UPDATE_AUDITLOG_SUCCESS'; payload: { auditLog: AuditLog; }; }
    | { type: 'FETCH_DETAIL_INIT'; }
    | { type: 'FETCH_DETAIL_SUCCESS'; payload: AuditLog; }
    | { type: 'FETCH_DETAIL_FAILURE'; payload: string; }
    | { type: 'CLEAR_SELECTED_AUDITLOG'; };

// Reducer
const auditLogsReducer = (state: AuditLogsState, action: AuditLogsAction): AuditLogsState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, isLoading: true, error: null };

        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                auditLogs: action.payload.auditLogs,
                totalCount: action.payload.totalCount,
                hasMore: action.payload.hasMore
            };

        case 'FETCH_FAILURE':
            return { ...state, isLoading: false, error: action.payload };

        case 'ADD_SUCCESS':
            return {
                ...state,
                auditLogs: [action.payload, ...state.auditLogs],
                totalCount: state.totalCount + 1
            };

        case 'REMOVE_SUCCESS':
            return {
                ...state,
                auditLogs: state.auditLogs.filter(auditLog => auditLog.id !== action.payload.id),
                totalCount: state.totalCount - 1,
                isActionLoading: false,
                selectedAuditLog: state.selectedAuditLog?.id === action.payload.id ? null : state.selectedAuditLog
            };

        case 'REMOVE_MULTIPLE_SUCCESS':
            return {
                ...state,
                auditLogs: state.auditLogs.filter(auditLog => !action.payload.ids.includes(auditLog.id)),
                totalCount: state.totalCount - action.payload.ids.length,
                isActionLoading: false,
                selectedAuditLog: state.selectedAuditLog && action.payload.ids.includes(state.selectedAuditLog.id)
                    ? null
                    : state.selectedAuditLog
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
                auditLogs: state.auditLogs.map(auditLog =>
                    auditLog.id === action.payload.auditLog.id
                        ? action.payload.auditLog
                        : auditLog
                ),
                selectedAuditLog: state.selectedAuditLog?.id === action.payload.auditLog.id
                    ? action.payload.auditLog
                    : state.selectedAuditLog,
                isActionLoading: false,
            };

        case 'UPDATE_AUDITLOG_SUCCESS':
            return {
                ...state,
                auditLogs: state.auditLogs.map(auditLog =>
                    auditLog.id === action.payload.auditLog.id
                        ? { ...auditLog, ...action.payload.auditLog }
                        : auditLog
                ),
                selectedAuditLog: state.selectedAuditLog?.id === action.payload.auditLog.id
                    ? { ...state.selectedAuditLog, ...action.payload.auditLog }
                    : state.selectedAuditLog,
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
                selectedAuditLog: action.payload,
                detailError: null
            };

        case 'FETCH_DETAIL_FAILURE':
            return {
                ...state,
                isDetailLoading: false,
                detailError: action.payload,
                selectedAuditLog: null
            };

        case 'CLEAR_SELECTED_AUDITLOG':
            return {
                ...state,
                selectedAuditLog: null,
                detailError: null,
                isDetailLoading: false
            };

        case 'FETCH_ALL_INIT':
            return { ...state, isAllLoading: true, error: null };

        case 'FETCH_ALL_SUCCESS':
                return { ...state, isAllLoading: false, allAuditLogs: action.payload };

        case 'FETCH_ALL_FAILURE':
                return { ...state, isAllLoading: false, error: action.payload };

        default:
            return state;
    }
};

// Initial state
const initialState: AuditLogsState = {
    auditLogs: [],
    selectedAuditLog: null,
    allAuditLogs: [],
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
const AuditLogsStateContext = React.createContext<AuditLogsState | undefined>(undefined);
const AuditLogsDispatchContext = React.createContext<React.Dispatch<AuditLogsAction> | undefined>(undefined);

// Provider props
interface AuditLogsProviderProps {
    children: React.ReactNode;
    debounceDelay?: number;
}

export const AuditLogsProvider: React.FC<AuditLogsProviderProps> = ({
    children,
    debounceDelay = 300
}) => {
    const [state, dispatch] = React.useReducer(auditLogsReducer, initialState);

    return (
        <AuditLogsStateContext.Provider value={state}>
            <AuditLogsDispatchContext.Provider value={dispatch}>
                {children}
            </AuditLogsDispatchContext.Provider>
        </AuditLogsStateContext.Provider>
    );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useAuditLogsState = (): AuditLogsState => {
    const context = React.useContext(AuditLogsStateContext);
    if (context === undefined) {
        throw new Error('useAuditLogsState must be used within a AuditLogsProvider');
    }
    return context;
};

export const useAuditLogsDispatch = (): React.Dispatch<AuditLogsAction> => {
    const context = React.useContext(AuditLogsDispatchContext);
    if (context === undefined) {
        throw new Error('useAuditLogsDispatch must be used within a AuditLogsProvider');
    }
    return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useAuditLogsActions = (debounceDelay: number = 300) => {
    const state = useAuditLogsState();
    const dispatch = useAuditLogsDispatch();
    const { toast } = useToast();
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const { permissions } = useAuthState();
    console.log(permissions);
    const userPermissions = React.useMemo(() => ({
        canPermissionsRead: CORE_PERMISSIONS.AUDIT_PERMISSIONS_READ,
    }), [hasPermission]);

    // ✅ Sử dụng refs để track state và prevent unnecessary calls
    const currentTableStateRef = React.useRef<TableState | null>(null);
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = React.useRef(false);
    const lastFetchParamsRef = React.useRef<string>('');

    // ✅ Stable fetch function với ref để prevent recreation
    const fetchAuditLogsInternal = React.useCallback(async (tableState: TableState, searchQuery: string) => {
        // ✅ Prevent duplicate calls bằng cách compare parameters
        const currentParams = JSON.stringify({ tableState, searchQuery });
        if (lastFetchParamsRef.current === currentParams) {
            console.log('🚫 Duplicate API call prevented');
            return;
        }

        console.log('🔥 fetchAuditLogsInternal called with:', { tableState, searchQuery });
        lastFetchParamsRef.current = currentParams;

        dispatch({ type: 'FETCH_INIT' });
        try {
            if (permissions.includes(userPermissions.canPermissionsRead)) {
                const result = await getAuditLogsWithOData(tableState, searchQuery);
                dispatch({ type: 'FETCH_SUCCESS', payload: result });

                const data = await getAuditLogs();
                dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
            } else {
                const result = await getAuditLogsMeWithOData(tableState, searchQuery);
                dispatch({ type: 'FETCH_SUCCESS', payload: result });

                const data = await getAuditLogsMe();
                dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
            }

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

    const fetchAuditLogsByField = React.useCallback(async (field: string, searchQuery: string) => {
        // try {
        //   const result = await getClientsByFieldWithOData(field, searchQuery);
        //   return result;
        // } catch (error) {
        //   console.error(error);
        //   return null;
        // }
    }, []);

    const searchAuditLogsByField = React.useCallback(async (field: string, searchQuery: string) => {
        // try {
        //   const result = await searchAuditLogsByFieldWithOData(field, searchQuery);
        //   return result;
        // } catch (error) {
        //   console.error(error);
        //   return null;
        // }
    }, []);

    // ✅ Main fetch function - CHỈ update ref, KHÔNG trigger search effect
    const fetchAuditLogs = React.useCallback(async (tableState: TableState) => {
        console.log('📋 fetchAuditLogs called');

        // Clear existing timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // Update ref KHÔNG trigger re-render
        currentTableStateRef.current = tableState;

        // ✅ Call immediately cho non-search requests
        await fetchAuditLogsInternal(tableState, state.searchTerm);
    }, [fetchAuditLogsInternal, state.searchTerm]);

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
            fetchAuditLogsInternal(currentTableStateRef.current!, state.searchTerm);
        }, debounceDelay);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [state.searchTerm, debounceDelay]);

    // ✅ Initialization effect - CHỈ chạy 1 lần
    React.useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            console.log('✅ AuditLogsActions initialized');
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

    const fetchAllAuditLogs = React.useCallback(async (): Promise<AuditLog[]> => {
        dispatch({ type: 'FETCH_ALL_INIT' });
        try {
            let data: AuditLog[];

            if (permissions.includes(userPermissions.canPermissionsRead)) {
            data = await getAuditLogs();
            } else {
            data = await getAuditLogsMe();
            }

            dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
            return data;
        } catch (err) {
            dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
            return []; // luôn trả về mảng
        }
    }, [permissions, userPermissions, dispatch]);


    // CRUD actions
    const addAuditLog = React.useCallback(async (newAuditLogData: Omit<AuditLog, 'id' | 'status'>) => {
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });
        try {
            //   const newClient = await createClient(newClientData);
            //   dispatch({ type: 'ADD_SUCCESS', payload: newClient });
            //dispatch({ type: 'SET_ACTION_LOADING', payload: false });
            toast({
                title: 'Success',
                description: `Client created successfully!`,
                variant: 'default',
            });

            //   router.push(`/en/clients/${newClient}`);
            return true;

        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });
            return false;
        }

    }, [dispatch]);

    const removeAuditLog = React.useCallback(async (clientId: string) => {
        const originalState = { ...state };
        dispatch({ type: 'REMOVE_SUCCESS', payload: { id: clientId } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            //   await deleteClient(clientId);
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });
            return true;
        } catch (error) {
            //   dispatch({
            //     type: 'FETCH_SUCCESS', payload: {
            //       clients: originalState.clients,
            //       totalCount: originalState.totalCount,
            //       hasMore: originalState.hasMore
            //     }
            //   });
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });
            return false;
        }
    }, [state, dispatch]);

    const removeMultipleAuditLogs = React.useCallback(async (clientIds: string[]) => {
        const originalState = { ...state };
        dispatch({ type: 'REMOVE_MULTIPLE_SUCCESS', payload: { ids: clientIds } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            //   await deleteMultipleClients(clientIds);
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });
            return true;
        } catch (error) {
            //   dispatch({
            //     type: 'FETCH_SUCCESS', payload: {
            //       clients: originalState.clients,
            //       totalCount: originalState.totalCount,
            //       hasMore: originalState.hasMore
            //     }
            //   });
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });
            return false;
        }
    }, [state, dispatch]);

    const updateStatus = React.useCallback(async (auditLogId: string, newStatus: number) => {
        // ✅ Tìm client trong cả clients array VÀ selectedClient
        const originalClient =
            state.auditLogs.find(auditLog => auditLog.id === auditLogId) ||
            (state.selectedAuditLog?.id === auditLogId ? state.selectedAuditLog : null);

        if (!originalClient) {
            dispatch({ type: 'SET_ERROR', payload: 'Client not found' });
            return false;
        }

        // ✅ Optimistic update - chỉ thay đổi status
        const optimisticClient: AuditLog = {
            ...originalClient,
            //   status: newStatus
        };

        dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { auditLog: optimisticClient } });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            // ✅ Call API - có thể chỉ cần success response
            //   await updateClientStatus(clientId, newStatus);

            // ✅ KHÔNG dispatch lại nữa, vì optimistic update đã đúng rồi
            // Chỉ tắt loading
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });

            console.log('✅ Client status updated successfully');
            return true;
        } catch (error) {
            // ✅ Rollback về trạng thái ban đầu
            dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { auditLog: originalClient } });
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });

            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });

            console.error('❌ Update client status failed:', error);
            return false;
        }
    }, [state.auditLogs, state.selectedAuditLog, dispatch]);


    // ✅ Thêm client detail actions
    const fetchAuditLogById = React.useCallback(async (auditLogId: string) => {
        dispatch({ type: 'FETCH_DETAIL_INIT' });

        try {
            const auditLog = await getAuditLogById(auditLogId);
            dispatch({ type: 'FETCH_DETAIL_SUCCESS', payload: auditLog });
            return auditLog;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'FETCH_DETAIL_FAILURE', payload: message });
            throw error;
        }
    }, [dispatch]);

    const clearSelectedAuditLog = React.useCallback(() => {
        //dispatch({ type: 'CLEAR_SELECTED_CLIENT' });
    }, [dispatch]);

    // ✅ Get client from cache hoặc fetch
    const getAuditLogDetails = React.useCallback(async (auditLogId: string) => {
        // Kiểm tra xem client đã có trong cache chưa
        const cachedClient = state.auditLogs.find(auditLog => auditLog.id === auditLogId);

        if (cachedClient) {
            // Nếu có trong cache, dùng luôn
            dispatch({ type: 'FETCH_DETAIL_SUCCESS', payload: cachedClient });
            return cachedClient;
        }

        // Nếu không có, fetch từ API
        return await fetchAuditLogById(auditLogId);
    }, [state.auditLogs, fetchAuditLogById, dispatch]);

    // ✅ NEW: Update Client Action
    const updateAuditLogData = React.useCallback(async (clientId: string, updateData: Omit<any, 'id'>) => {
        // ✅ Tìm client trong cả clients array VÀ selectedClient
        // const originalClient =
        //   state.clients.find(client => client.id === clientId) ||
        //   (state.selectedClient?.id === clientId ? state.selectedClient : null);

        // if (!originalClient) {
        //   dispatch({ type: 'SET_ERROR', payload: 'Client not found' });
        //   return false;
        // }

        // // Optimistic update - cập nhật UI ngay lập tức
        // const optimisticClient: Client = {
        //   ...originalClient,
        //   ...updateData,
        // };

        // dispatch({ type: 'UPDATE_CLIENT_SUCCESS', payload: { client: optimisticClient } });
        // dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        // try {
        //   // Call API với full updateAuditLogData
        //   const fullUpdateData: updateAuditLogData = {
        //     ...originalClient,
        //     ...updateData,
        //     id: clientId,
        //   };

        //   const updatedClient = await updateClient(clientId, fullUpdateData);

        //   // Update với data thật từ server
        //   dispatch({ type: 'UPDATE_CLIENT_SUCCESS', payload: { client: updatedClient } });
        //   dispatch({ type: 'SET_ACTION_LOADING', payload: false });

        //   console.log('✅ Client updated successfully:', updatedClient);
        //   toast({
        //     title: 'Success',
        //     description: `Client details updated successfully!`,
        //     variant: 'default',
        //   });

        //   return true;
        // } catch (error: any) {
        //   // Rollback về trạng thái ban đầu
        //   dispatch({ type: 'UPDATE_CLIENT_SUCCESS', payload: { client: originalClient } });

        //   const message = error instanceof Error ? error.message : 'An unknown error occurred';
        //   dispatch({ type: 'SET_ERROR', payload: message });

        //   toast({
        //     title: 'Error',
        //     description: message,
        //     variant: 'destructive',
        //   });

        //   console.error('❌ Update client failed:', error);
        //   return false;
        // }
    }, [state.auditLogs, state.selectedAuditLog, dispatch]);

    return {
        // State (for easy access)
        ...state,

        //Search
        setSearchTerm,
        clearSearch,
        isSearching,

        // Actions
        fetchAuditLogsByField,
        fetchAuditLogs,
        fetchAllAuditLogs,
        addAuditLog,
        removeAuditLog,
        removeMultipleAuditLogs,
        updateStatus,
        updateAuditLogData,

        // ✅ Detail actions
        searchAuditLogsByField,
        fetchAuditLogById,
        getAuditLogDetails,
        clearSelectedAuditLog,
    };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useAuditLogsData = () => {
    const state = useAuditLogsState();

    return {
        auditLogs: state.auditLogs,
        isLoading: state.isLoading,
        allAuditLogs: state.allAuditLogs,
        isAllLoading: state.isAllLoading,
        isActionLoading: state.isActionLoading,
        error: state.error,
        totalCount: state.totalCount,
        hasMore: state.hasMore,
        searchTerm: state.searchTerm,
        isSearching: state.searchTerm.trim().length > 0,
    };
};

export const useAuditLogDetail = () => {
    const state = useAuditLogsState();

    return {
        selectedAuditLog: state.selectedAuditLog,
        isDetailLoading: state.isDetailLoading,
        detailError: state.detailError,
    };
};

