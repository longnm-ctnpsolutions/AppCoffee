"use client";

import * as React from 'react';
import type { Application } from '@/features/applications/types/application.types';
import type { TableState } from '@/shared/types/odata.types';
import { getApplicationsWithOData, type ApplicationsQueryResult } from "@/shared/api/services/applications/applications-odata.service";


// State interface
interface ApplicationsState {
  applications: Application[];
  selectedApplication: Application | null;
  isLoading: boolean;
  isActionLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
  detailError: string | null;
  totalCount: number;
  hasMore: boolean;
  searchTerm: string;
}

// Actions
type ApplicationsAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_SUCCESS'; payload: ApplicationsQueryResult }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'ADD_SUCCESS'; payload: Application }
  | { type: 'REMOVE_SUCCESS'; payload: { id: string } }
  | { type: 'REMOVE_MULTIPLE_SUCCESS'; payload: { ids: string[] } }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'UPDATE_STATUS_SUCCESS'; payload: { application: Application } }
  | { type: 'UPDATE_APPLICATION_SUCCESS'; payload: { application: Application } }
  | { type: 'FETCH_DETAIL_INIT' }
  | { type: 'FETCH_DETAIL_SUCCESS'; payload: Application }
  | { type: 'FETCH_DETAIL_FAILURE'; payload: string }
  | { type: 'CLEAR_SELECTED_APPLICATION' };

// Reducer
const applicationsReducer = (state: ApplicationsState, action: ApplicationsAction): ApplicationsState => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        applications: action.payload.applications,
        totalCount: action.payload.totalCount,
        hasMore: action.payload.hasMore
      };

    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };

    case 'ADD_SUCCESS':
      return {
        ...state,
        applications: [action.payload, ...state.applications],
        totalCount: state.totalCount + 1
      };

    case 'REMOVE_SUCCESS':
      return {
        ...state,
        applications: state.applications.filter(application => application.id !== action.payload.id),
        totalCount: state.totalCount - 1,
        isActionLoading: false,
        selectedApplication: state.selectedApplication?.id === action.payload.id ? null : state.selectedApplication
      };

    case 'REMOVE_MULTIPLE_SUCCESS':
      return {
        ...state,
        applications: state.applications.filter(application => !action.payload.ids.includes(application.id)),
        totalCount: state.totalCount - action.payload.ids.length,
        isActionLoading: false,
        selectedApplication: state.selectedApplication && action.payload.ids.includes(state.selectedApplication.id)
        ? null
        : state.selectedApplication
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
        applications: state.applications.map(application =>
          application.id === action.payload.application.id
            ? action.payload.application
            : application
        ),
        selectedApplication: state.selectedApplication?.id === action.payload.application.id
          ? action.payload.application
          : state.selectedApplication,
        isActionLoading: false,
      };

    case 'UPDATE_APPLICATION_SUCCESS':
      return {
        ...state,
        applications: state.applications.map(application =>
          application.id === action.payload.application.id
            ? { ...application, ...action.payload.application }
            : application
        ),
        selectedApplication: state.selectedApplication?.id === action.payload.application.id
          ? { ...state.selectedApplication, ...action.payload.application }
          : state.selectedApplication,
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
        selectedApplication: action.payload,
        detailError: null
      };

    case 'FETCH_DETAIL_FAILURE':
      return {
        ...state,
        isDetailLoading: false,
        detailError: action.payload,
        selectedApplication: null
      };

    case 'CLEAR_SELECTED_APPLICATION':
      return {
        ...state,
        selectedApplication: null,
        detailError: null,
        isDetailLoading: false
      };

    default:
      return state;
  }
};

// Initial state
const initialState: ApplicationsState = {
  applications: [],
  selectedApplication: null,
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
const ApplicationsStateContext = React.createContext<ApplicationsState | undefined>(undefined);
const ApplicationsDispatchContext = React.createContext<React.Dispatch<ApplicationsAction> | undefined>(undefined);

// Provider props
interface ApplicationsProviderProps {
  children: React.ReactNode;
  debounceDelay?: number;
}

export const ApplicationsProvider: React.FC<ApplicationsProviderProps> = ({
  children,
  debounceDelay = 300
}) => {
  const [state, dispatch] = React.useReducer(applicationsReducer, initialState);

  return (
    <ApplicationsStateContext.Provider value={state}>
      <ApplicationsDispatchContext.Provider value={dispatch}>
        {children}
      </ApplicationsDispatchContext.Provider>
    </ApplicationsStateContext.Provider>
  );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useApplicationsState = (): ApplicationsState => {
  const context = React.useContext(ApplicationsStateContext);
  if (context === undefined) {
    throw new Error('useApplicationsState must be used within a ApplicationsProvider');
  }
  return context;
};

export const useApplicationsDispatch = (): React.Dispatch<ApplicationsAction> => {
  const context = React.useContext(ApplicationsDispatchContext);
  if (context === undefined) {
    throw new Error('useApplicationsDispatch must be used within a ApplicationsProvider');
  }
  return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useApplicationsActions = (debounceDelay: number = 300) => {
  const state = useApplicationsState();
  const dispatch = useApplicationsDispatch();

  // ✅ Sử dụng refs để track state và prevent unnecessary calls
  const currentTableStateRef = React.useRef<TableState | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = React.useRef(false);
  const lastFetchParamsRef = React.useRef<string>('');

  // ✅ Stable fetch function với ref để prevent recreation
  const fetchApplicationsInternal = React.useCallback(async (tableState: TableState, searchQuery: string) => {
    // ✅ Prevent duplicate calls bằng cách compare parameters
    const currentParams = JSON.stringify({ tableState, searchQuery });
    if (lastFetchParamsRef.current === currentParams) {
      console.log('🚫 Duplicate API call prevented');
      return;
    }

    console.log('🔥 fetchApplicationsInternal called with:', { tableState, searchQuery });
    lastFetchParamsRef.current = currentParams;

    dispatch({ type: 'FETCH_INIT' });
    try {
      const result = await getApplicationsWithOData(tableState, searchQuery);
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
  const fetchApplications = React.useCallback(async (tableState: TableState) => {
    console.log('📋 fetchApplications called');

    // Clear existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Update ref KHÔNG trigger re-render
    currentTableStateRef.current = tableState;

    // ✅ Call immediately cho non-search requests
    await fetchApplicationsInternal(tableState, state.searchTerm);
  }, [fetchApplicationsInternal, state.searchTerm]);

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
      fetchApplicationsInternal(currentTableStateRef.current!, state.searchTerm);
    }, debounceDelay);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [state.searchTerm, fetchApplicationsInternal, debounceDelay]);

  // ✅ Initialization effect - CHỈ chạy 1 lần
  React.useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('✅ ApplicationsActions initialized');
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


  // ✅ Thêm application detail actions

  return {
    // State (for easy access)
    ...state,

    // Search
    setSearchTerm,
    clearSearch,
    isSearching,

    // Actions
    fetchApplications,

  };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useApplicationsData = () => {
  const state = useApplicationsState();

  return {
    applications: state.applications,
    isLoading: state.isLoading,
    isActionLoading: state.isActionLoading,
    error: state.error,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    searchTerm: state.searchTerm,
    isSearching: state.searchTerm.trim().length > 0,
  };
};

export const useApplicationDetail = () => {
  const state = useApplicationsState();

  return {
    selectedApplication: state.selectedApplication,
    isDetailLoading: state.isDetailLoading,
    detailError: state.detailError,
  };
};