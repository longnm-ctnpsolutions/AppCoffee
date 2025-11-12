"use client";

import * as React from 'react';
import type { Client } from '@/features/clients/types/client.types';
import type { TableState } from '@/types/odata.types';
import { getClientsWithOData, type ClientsQueryResult } from "@/shared/api/services/clients/clients-odata.service";
import {
  createClient,
  deleteClient,
  deleteMultipleClients,
} from '@/shared/api/services/clients/clients.service';

// State interface
interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  searchTerm: string;
}

// Actions
type ClientsAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: ClientsQueryResult }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'ADD_SUCCESS'; payload: Client }
  | { type: 'REMOVE_SUCCESS'; payload: { id: string } }
  | { type: 'REMOVE_MULTIPLE_SUCCESS'; payload: { ids: string[] } }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_SEARCH' };

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
      };
    case 'REMOVE_MULTIPLE_SUCCESS':
      return {
        ...state,
        clients: state.clients.filter(client => !action.payload.ids.includes(client.id)),
        totalCount: state.totalCount - action.payload.ids.length,
        isActionLoading: false,
      };
    case 'SET_ACTION_LOADING':
      return { ...state, isActionLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isActionLoading: false };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'CLEAR_SEARCH':
      return { ...state, searchTerm: '' };
    default:
      return state;
  }
};

// Initial state
const initialState: ClientsState = {
  clients: [],
  isLoading: false,
  isActionLoading: false,
  error: null,
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
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const newClient = await createClient(newClientData);
      dispatch({ type: 'ADD_SUCCESS', payload: newClient });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }
  }, [dispatch]);

  const removeClient = React.useCallback(async (clientId: string) => {
    const originalState = { ...state };
    dispatch({ type: 'REMOVE_SUCCESS', payload: { id: clientId } });
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    
    try {
      await deleteClient(clientId);
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      return true;
    } catch (error) {
      dispatch({ type: 'FETCH_SUCCESS', payload: {
        clients: originalState.clients,
        totalCount: originalState.totalCount,
        hasMore: originalState.hasMore
      }});
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
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      return true;
    } catch (error) {
      dispatch({ type: 'FETCH_SUCCESS', payload: {
        clients: originalState.clients,
        totalCount: originalState.totalCount,
        hasMore: originalState.hasMore
      }});
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      return false;
    }
  }, [state, dispatch]);

  return {
    // State (for easy access)
    ...state,
    
    // Search
    setSearchTerm,
    clearSearch,
    isSearching,
    
    // Actions
    fetchClients,
    addClient,
    removeClient,
    removeMultipleClients,
  };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useClientsData = () => {
  const state = useClientsState();
  
  return {
    clients: state.clients,
    isLoading: state.isLoading,
    isActionLoading: state.isActionLoading,
    error: state.error,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    searchTerm: state.searchTerm,
    isSearching: state.searchTerm.trim().length > 0,
  };
};