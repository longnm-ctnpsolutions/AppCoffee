"use role";

import * as React from 'react';
import type { RoleUser } from '@/features/roles/types/role.types';
import type { TableState } from '@/types/odata.types';
import { getRoleUsersWithOData, type RoleUsersQueryResult } from "@/shared/api/services/roles/roles-odata.service";
import { createRoleUser, deleteRoleUserId, getRoleUser } from "@/shared/api/services/roles/roles.service";

interface AddRoleUserRequest {
  email: string;
  description: string;
}

interface RoleUsersState {
  roleUsers: RoleUser[];
  isLoading: boolean;
  allRoleUsers: RoleUser[];
  isActionLoading: boolean;
  isAllLoading: boolean;
  error: string | null;
  totalCount: number;
  hasMore: boolean;
  searchTerm: string;
  selectedRoleUser: RoleUser | null; 
}

type RoleUsersAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: RoleUsersQueryResult }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'FETCH_ALL_INIT' }
  | { type: 'FETCH_ALL_SUCCESS'; payload: RoleUser[] }        // thêm
  | { type: 'FETCH_ALL_FAILURE'; payload: string }
  | { type: 'ADD_SUCCESS'; payload: RoleUser }
  | { type: 'ADD_MANY_SUCCESS'; payload: { ids: string[] } }
  | { type: 'REMOVE_SUCCESS'; payload: { id: string } }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'CLEAR_SELECTED_CLIENT' };


const roleUsersReducer = (state: RoleUsersState, action: RoleUsersAction): RoleUsersState => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };
      
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        isLoading: false, 
        roleUsers: action.payload.roles,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore
      };
      
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
      
    case 'ADD_SUCCESS':
      return { 
        ...state, 
        roleUsers: [action.payload, ...state.roleUsers],
        totalCount: state.totalCount + 1 
      };

      case "ADD_MANY_SUCCESS":
      return {
        ...state,
        // filter bỏ những id vừa thêm nếu muốn
        roleUsers: state.roleUsers.filter(
          p => !action.payload.ids.includes(p.id)
        ),
        totalCount: state.totalCount + action.payload.ids.length,
        isActionLoading: false,
        selectedRoleUser: state.selectedRoleUser && action.payload.ids.includes(state.selectedRoleUser.id) 
        ? null 
        : state.selectedRoleUser
      };
      
    case 'REMOVE_SUCCESS':
      return {
        ...state,
        roleUsers: state.roleUsers.filter(roleUser => roleUser.id !== action.payload.id),
        totalCount: state.totalCount - 1,
        isActionLoading: false,
        selectedRoleUser: state.selectedRoleUser?.id === action.payload.id ? null : state.selectedRoleUser
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
      return { ...state, isAllLoading: false, allRoleUsers: action.payload };

    case 'FETCH_ALL_FAILURE':
      return { ...state, isAllLoading: false, error: action.payload };
         
    default:
      return state;
  }
};

// Initial state
const initialState: RoleUsersState = {
  roleUsers: [],
  selectedRoleUser: null,
  allRoleUsers: [],
  isAllLoading: false,
  isLoading: false,
  isActionLoading: false,
  error: null,
  totalCount: 0,
  hasMore: false,
  searchTerm: '',
};

const RoleUsersStateContext = React.createContext<RoleUsersState | undefined>(undefined);
const RoleUsersDispatchContext = React.createContext<React.Dispatch<RoleUsersAction> | undefined>(undefined);


interface PermisionsProviderProps {
  children: React.ReactNode;
  debounceDelay?: number;
}

export const RoleUsersProvider : React.FC<PermisionsProviderProps> = ({ 
  children
}) => {
  const [state, dispatch] = React.useReducer(roleUsersReducer, initialState);

  return (
    <RoleUsersStateContext.Provider value={state}>
      <RoleUsersDispatchContext.Provider value={dispatch}>
        {children}
      </RoleUsersDispatchContext.Provider>
    </RoleUsersStateContext.Provider>
  );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useRoleUsersState = (): RoleUsersState => {
  const context = React.useContext(RoleUsersStateContext);
  if (context === undefined) {
    throw new Error('useRoleUsersState must be used within a RoleUsersProvider');
  }
  return context;
};

export const useRoleUsersDispatch = (): React.Dispatch<RoleUsersAction> => {
  const context = React.useContext(RoleUsersDispatchContext);
  if (context === undefined) {
    throw new Error('useRoleUsersDispatch must be used within a RoleUsersProvider');
  }
  return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useRoleUsersStateActions = (roleId: string, debounceDelay: number = 300) => {
  const state = useRoleUsersState();
  const dispatch = useRoleUsersDispatch();
  
  // Refs để track state và prevent unnecessary calls
  const currentTableStateRef = React.useRef<TableState | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = React.useRef(false);
  const lastFetchParamsRef = React.useRef<string>('');

  // Stable fetch function với ref để prevent recreation
  const fetchRoleUsersInternal = React.useCallback(async (roleId: string, tableState: TableState, searchQuery: string) => {
    // Prevent duplicate calls bằng cách compare parameters
    const currentParams = JSON.stringify({ tableState, searchQuery });
    if (lastFetchParamsRef.current === currentParams) {
      console.log('🚫 Duplicate API call prevented');
      return;
    }
    
    console.log('🔥 fetchRoleUsersInternal called with:', { roleId, tableState, searchQuery });
    lastFetchParamsRef.current = currentParams;
    
    dispatch({ type: 'FETCH_INIT' });
    try {
      const result = await getRoleUsersWithOData(roleId, tableState, searchQuery);
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
  const fetchRoleUsers = React.useCallback(async (roleId: string, tableState: TableState) => {
    console.log('📋 fetchRoleUsers called');
    
    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    // Update ref KHÔNG trigger re-render
    currentTableStateRef.current = tableState;
    
    // Call immediately cho non-search requests
    await fetchRoleUsersInternal(roleId, tableState, state.searchTerm);
  }, [fetchRoleUsersInternal, state.searchTerm]);

    // Main fetch function - CHỈ update ref, KHÔNG trigger search effect

  const fetchAllRoleUsers = React.useCallback(async () => {
      dispatch({ type: 'FETCH_ALL_INIT' });
      try {
        const data = await getRoleUser(roleId);
        dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
      }
  }, [fetchRoleUsersInternal, dispatch]);

  const addRoleUserAction = React.useCallback(async (userIds: string[]) => {
    console.log('➕ Adding roleUser:', roleId);
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    
    try {
      const isCreateRoleUser = await createRoleUser(roleId, userIds);
      await fetchAllRoleUsers();
      dispatch({ type: 'ADD_MANY_SUCCESS', payload: { ids: userIds }});
      console.log('✅ RoleUser added successfully:');

      if (currentTableStateRef.current) {
        await fetchRoleUsersInternal(roleId, currentTableStateRef.current, state.searchTerm);
      }

      if (!isCreateRoleUser){
        return false
      }
      
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add roleUser';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('❌ Add roleUser failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [roleId, dispatch, fetchRoleUsersInternal, state.searchTerm]);

  // ✅ DELETE PERMISSION ACTION
  const deleteRoleUserAction = React.useCallback(async (roleUserId: string) => {
    console.log('🗑️ Deleting roleUser:', roleUserId);
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    
    try {
      await deleteRoleUserId(roleId, roleUserId);
      await fetchAllRoleUsers();
      dispatch({ type: 'REMOVE_SUCCESS', payload: { id: roleUserId } });
      console.log('✅ RoleUser deleted successfully:', roleUserId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete roleUser';
      dispatch({ type: 'SET_ERROR', payload: message });
      console.error('❌ Delete roleUser failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
    }
  }, [roleId, dispatch]);

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
      fetchRoleUsersInternal(roleId, currentTableStateRef.current!, state.searchTerm);
    }, debounceDelay);
    
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [state.searchTerm, fetchRoleUsersInternal, debounceDelay, roleId]);

  // Initialization effect - CHỈ chạy 1 lần
  React.useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('✅ RoleUsersActions initialized');
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
    fetchRoleUsers,
    fetchAllRoleUsers,
    addRoleUserAction,
    deleteRoleUserAction,

  };
};


// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useRoleUsersData = () => {
  const state = useRoleUsersState();
  
  return {
    roleUsers: state.roleUsers,
    allRoleUsers: state.allRoleUsers,
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