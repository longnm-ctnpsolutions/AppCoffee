"use client";

import * as React from 'react';
import type { Client } from '@/features/clients/types/client.types';
import type { TableState } from '@/types/odata.types';
import { getClientsWithOData, getClientsByFieldWithOData, searchClientsByFieldWithOData, type ClientsQueryResult } from "@/shared/api/services/clients/clients-odata.service";
import {
  createClient,
  deleteClient,
  deleteMultipleClients,
  updateClientStatus,
  getClientById,
  updateClient,
  type UpdateClientData,
  getClients,
} from '@/shared/api/services/clients/clients.service';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

// State interface
interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  allClients: Client[];
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
type ClientsAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: ClientsQueryResult }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'FETCH_ALL_INIT'; }
  | { type: 'FETCH_ALL_SUCCESS'; payload: Client[]; }        // thêm
  | { type: 'FETCH_ALL_FAILURE'; payload: string; }
  | { type: 'ADD_SUCCESS'; payload: Client }
  | { type: 'REMOVE_SUCCESS'; payload: { id: string } }
  | { type: 'REMOVE_MULTIPLE_SUCCESS'; payload: { ids: string[] } }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'UPDATE_STATUS_SUCCESS'; payload: { client: Client } }
  | { type: 'UPDATE_CLIENT_SUCCESS'; payload: { client: Client } }
  | { type: 'FETCH_DETAIL_INIT' }
  | { type: 'FETCH_DETAIL_SUCCESS'; payload: Client }
  | { type: 'FETCH_DETAIL_FAILURE'; payload: string }
  | { type: 'CLEAR_SELECTED_CLIENT' };

// Reducer
const clientsReducer = (state: ClientsState, action: ClientsAction): ClientsState => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        clients: action.payload.clients,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore
      };

    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'ADD_SUCCESS':
      return {
        ...state,
        clients: [action.payload, ...state.clients],
        totalCount: state.totalCount + 1
      };

    case 'REMOVE_SUCCESS':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload.id),
        totalCount: state.totalCount - 1,
        isActionLoading: false,
        selectedClient: state.selectedClient?.id === action.payload.id ? null : state.selectedClient
      };

    case 'REMOVE_MULTIPLE_SUCCESS':
      return {
        ...state,
        clients: state.clients.filter(client => !action.payload.ids.includes(client.id)),
        totalCount: state.totalCount - action.payload.ids.length,
        isActionLoading: false,
        selectedClient: state.selectedClient && action.payload.ids.includes(state.selectedClient.id)
          ? null
          : state.selectedClient
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
        clients: state.clients.map(client =>
          client.id === action.payload.client.id
            ? action.payload.client
            : client
        ),
        selectedClient: state.selectedClient?.id === action.payload.client.id
          ? action.payload.client
          : state.selectedClient,
        isActionLoading: false,
      };

    case 'UPDATE_CLIENT_SUCCESS':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.client.id
            ? { ...client, ...action.payload.client }
            : client
        ),
        selectedClient: state.selectedClient?.id === action.payload.client.id
          ? { ...state.selectedClient, ...action.payload.client }
          : state.selectedClient,
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
        selectedClient: action.payload,
        detailError: null
      };

    case 'FETCH_DETAIL_FAILURE':
      return {
        ...state,
        isDetailLoading: false,
        detailError: action.payload,
        selectedClient: null
      };

    case 'CLEAR_SELECTED_CLIENT':
      return {
        ...state,
        selectedClient: null,
        detailError: null,
        isDetailLoading: false
      };

    case 'FETCH_ALL_INIT':
      return { ...state, isAllLoading: true, error: null };

    case 'FETCH_ALL_SUCCESS':
      return { ...state, isAllLoading: false, allClients: action.payload };

    case 'FETCH_ALL_FAILURE':
      return { ...state, isAllLoading: false, error: action.payload };


    default:
      return state;
  }
};

// Initial state
const initialState: ClientsState = {
  clients: [],
  selectedClient: null,
  allClients: [],
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
const ClientsStateContext = React.createContext<ClientsState | undefined>(undefined);
const ClientsDispatchContext = React.createContext<React.Dispatch<ClientsAction> | undefined>(undefined);

// Provider props
interface ClientsProviderProps {
  children: React.ReactNode;
  debounceDelay?: number;
}

export const ClientsProvider: React.FC<ClientsProviderProps> = ({
  children,
  debounceDelay = 300
}) => {
  const [state, dispatch] = React.useReducer(clientsReducer, initialState);

  return (
    <ClientsStateContext.Provider value={state}>
      <ClientsDispatchContext.Provider value={dispatch}>
        {children}
      </ClientsDispatchContext.Provider>
    </ClientsStateContext.Provider>
  );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useClientsState = (): ClientsState => {
  const context = React.useContext(ClientsStateContext);
  if (context === undefined) {
    throw new Error('useClientsState must be used within a ClientsProvider');
  }
  return context;
};

export const useClientsDispatch = (): React.Dispatch<ClientsAction> => {
  const context = React.useContext(ClientsDispatchContext);
  if (context === undefined) {
    throw new Error('useClientsDispatch must be used within a ClientsProvider');
  }
  return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useClientsActions = (debounceDelay: number = 300) => {
  const state = useClientsState();
  const dispatch = useClientsDispatch();
  const { toast } = useToast();
  const router = useRouter();

  // ✅ Sử dụng refs để track state và prevent unnecessary calls
  const currentTableStateRef = React.useRef<TableState | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = React.useRef(false);
  const lastFetchParamsRef = React.useRef<string>('');

  // ✅ Stable fetch function với ref để prevent recreation
  const fetchClientsInternal = React.useCallback(async (tableState: TableState, searchQuery: string) => {
    // ✅ Prevent duplicate calls bằng cách compare parameters
    const currentParams = JSON.stringify({ tableState, searchQuery });
    if (lastFetchParamsRef.current === currentParams) {
      console.log('🚫 Duplicate API call prevented');
      return;
    }

    console.log('🔥 fetchClientsInternal called with:', { tableState, searchQuery });
    lastFetchParamsRef.current = currentParams;

    dispatch({ type: 'FETCH_INIT' });
    try {
      const result = await getClientsWithOData(tableState, searchQuery);
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

  const fetchClientsByField = React.useCallback(async (field: string, searchQuery: string) => {
    try {
      const result = await getClientsByFieldWithOData(field, searchQuery);
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  const searchClientsByField = React.useCallback(async (field: string, searchQuery: string) => {
    try {
      const result = await searchClientsByFieldWithOData(field, searchQuery);
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  // ✅ Main fetch function - CHỈ update ref, KHÔNG trigger search effect
  const fetchClients = React.useCallback(async (tableState: TableState) => {
    console.log('📋 fetchClients called');

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Update ref KHÔNG trigger re-render
    currentTableStateRef.current = tableState;

    // ✅ Call immediately cho non-search requests
    await fetchClientsInternal(tableState, state.searchTerm);
  }, [fetchClientsInternal, state.searchTerm]);

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
      fetchClientsInternal(currentTableStateRef.current!, state.searchTerm);
    }, debounceDelay);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [state.searchTerm, fetchClientsInternal, debounceDelay]);

  // ✅ Initialization effect - CHỈ chạy 1 lần
  React.useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('✅ ClientsActions initialized');
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

  // CRUD actions
  const addClient = React.useCallback(async (newClientData: Omit<Client, 'id' | 'status'>) => {
    //dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const newClient = await createClient(newClientData);

      await fetchAllClients();

      dispatch({ type: 'ADD_SUCCESS', payload: newClient });
      //dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      toast({
        title: 'Success',
        description: `Client created successfully!`,
        variant: 'default',
      });

      router.push(`/en/clients/${newClient}`);
      return true;

    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }

  }, [dispatch]);

  const removeClient = React.useCallback(async (clientId: string) => {
    const originalState = { ...state };
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });

    try {
      await deleteClient(clientId);

      await fetchAllClients();

      dispatch({ type: 'REMOVE_SUCCESS', payload: { id: clientId } });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      return true;
    } catch (error) {
      dispatch({
        type: 'FETCH_SUCCESS', payload: {
          clients: originalState.clients,
          totalCount: originalState.totalCount,
          hasMore: originalState.hasMore
        }
      });
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }
  }, [state, dispatch]);

  const removeMultipleClients = React.useCallback(async (clientIds: string[]) => {
    const originalState = { ...state };
    dispatch({ type: 'REMOVE_MULTIPLE_SUCCESS', payload: { ids: clientIds } });
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });

    try {
      await deleteMultipleClients(clientIds);

      await fetchAllClients();

      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      return true;
    } catch (error) {
      dispatch({
        type: 'FETCH_SUCCESS', payload: {
          clients: originalState.clients,
          totalCount: originalState.totalCount,
          hasMore: originalState.hasMore
        }
      });
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }
  }, [state, dispatch]);

  const updateStatus = React.useCallback(async (clientId: string, newStatus: number) => {
    // ✅ Tìm client trong cả clients array VÀ selectedClient  
    const originalClient =
      state.clients.find(client => client.id === clientId) ||
      (state.selectedClient?.id === clientId ? state.selectedClient : null);

    if (!originalClient) {
      dispatch({ type: 'SET_ERROR', payload: 'Client not found' });
      return false;
    }

    // ✅ Optimistic update - chỉ thay đổi status
    const optimisticClient: Client = {
      ...originalClient,
      status: newStatus
    };

    dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { client: optimisticClient } });
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });

    try {
      // ✅ Call API - có thể chỉ cần success response
      await updateClientStatus(clientId, newStatus);

      // ✅ KHÔNG dispatch lại nữa, vì optimistic update đã đúng rồi
      // Chỉ tắt loading
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });

      console.log('✅ Client status updated successfully');
      return true;
    } catch (error) {
      // ✅ Rollback về trạng thái ban đầu
      dispatch({ type: 'UPDATE_STATUS_SUCCESS', payload: { client: originalClient } });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });

      console.error('❌ Update client status failed:', error);
      return false;
    }
  }, [state.clients, state.selectedClient, dispatch]);

  const fetchAllClients = React.useCallback(async () => {
    dispatch({ type: 'FETCH_ALL_INIT' });
    try {
      const data = await getClients();
      dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
    }
  }, [fetchClientsInternal, dispatch]);


  // ✅ Thêm client detail actions
  const fetchClientById = React.useCallback(async (clientId: string) => {
    dispatch({ type: 'FETCH_DETAIL_INIT' });

    try {
      const client = await getClientById(clientId);
      dispatch({ type: 'FETCH_DETAIL_SUCCESS', payload: client });
      return client;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'FETCH_DETAIL_FAILURE', payload: message });
      throw error;
    }
  }, [dispatch]);

  const clearSelectedClient = React.useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_CLIENT' });
  }, [dispatch]);

  // ✅ Get client from cache hoặc fetch
  const getClientDetails = React.useCallback(async (clientId: string) => {
    // Kiểm tra xem client đã có trong cache chưa
    const cachedClient = state.clients.find(client => client.id === clientId);

    if (cachedClient) {
      // Nếu có trong cache, dùng luôn
      dispatch({ type: 'FETCH_DETAIL_SUCCESS', payload: cachedClient });
      return cachedClient;
    }

    // Nếu không có, fetch từ API
    return await fetchClientById(clientId);
  }, [state.clients, fetchClientById, dispatch]);

  // ✅ NEW: Update Client Action
  const updateClientData = React.useCallback(async (clientId: string, updateData: Omit<UpdateClientData, 'id'>) => {
    // ✅ Tìm client trong cả clients array VÀ selectedClient  
    const originalClient =
      state.clients.find(client => client.id === clientId) ||
      (state.selectedClient?.id === clientId ? state.selectedClient : null);

    if (!originalClient) {
      dispatch({ type: 'SET_ERROR', payload: 'Client not found' });
      return false;
    }

    // Optimistic update - cập nhật UI ngay lập tức
    const optimisticClient: Client = {
      ...originalClient,
      ...updateData,
    };

    dispatch({ type: 'UPDATE_CLIENT_SUCCESS', payload: { client: optimisticClient } });
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });

    try {
      // Call API với full UpdateClientData
      const fullUpdateData: UpdateClientData = {
        ...originalClient,
        ...updateData,
        id: clientId,
      };

      const updatedClient = await updateClient(clientId, fullUpdateData);

      // Update với data thật từ server
      dispatch({ type: 'UPDATE_CLIENT_SUCCESS', payload: { client: updatedClient } });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });

      console.log('✅ Client updated successfully:', updatedClient);
      toast({
        title: 'Success',
        description: `Client details updated successfully!`,
        variant: 'default',
      });

      return true;
    } catch (error: any) {
      // Rollback về trạng thái ban đầu
      dispatch({ type: 'UPDATE_CLIENT_SUCCESS', payload: { client: originalClient } });

      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      console.error('❌ Update client failed:', error);
      return false;
    }
  }, [state.clients, state.selectedClient, dispatch]);

  return {
    // State (for easy access)
    ...state,

    // Search
    setSearchTerm,
    clearSearch,
    isSearching,

    // Actions
    fetchClientsByField,
    fetchClients,
    fetchAllClients,
    addClient,
    removeClient,
    removeMultipleClients,
    updateStatus,
    updateClientData,

    // ✅ Detail actions
    searchClientsByField,
    fetchClientById,
    getClientDetails,
    clearSelectedClient,
  };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useClientsData = () => {
  const state = useClientsState();

  return {
    clients: state.clients,
    isLoading: state.isLoading,
    allClients: state.allClients,
    isAllLoading: state.isAllLoading,
    isActionLoading: state.isActionLoading,
    error: state.error,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    searchTerm: state.searchTerm,
    isSearching: state.searchTerm.trim().length > 0,
  };
};

export const useClientDetail = () => {
  const state = useClientsState();

  return {
    selectedClient: state.selectedClient,
    isDetailLoading: state.isDetailLoading,
    detailError: state.detailError,
  };
};

