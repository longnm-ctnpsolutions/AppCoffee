"use client";

import * as React from 'react';
import type { Files } from '@/features/clients/types/files.types';
import type { TableState } from '@/types/odata.types';
import {
  uploadFile
} from '@/shared/api/services/files/files.service';

interface FilesState {
  files: Files[];
  selectedFile: Files | null; 
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
type FileAction =
  | { type: 'FETCH_INIT' }
  | { type: 'FETCH_FAILURE'; payload: string }
  | { type: 'ADD_SUCCESS'; payload: Files }
  | { type: 'REMOVE_SUCCESS'; payload: { id: string } }
  | { type: 'REMOVE_MULTIPLE_SUCCESS'; payload: { ids: string[] } }
  | { type: 'SET_ACTION_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'FETCH_DETAIL_INIT' }
  | { type: 'FETCH_DETAIL_FAILURE'; payload: string }
  | { type: 'CLEAR_SELECTED_FILE' };

const filesReducer = (state: FilesState, action: FileAction): FilesState => {
  switch (action.type) {
    case 'FETCH_INIT':
      return { ...state, isLoading: true, error: null };
      
    case 'FETCH_FAILURE':
      return { ...state, isLoading: false, error: action.payload };
      
    case 'ADD_SUCCESS':
      return { 
        ...state, 
        files: [action.payload, ...state.files],
        totalCount: state.totalCount + 1 
      };
      
      
    case 'SET_ACTION_LOADING':
      return { ...state, isActionLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isActionLoading: false };
      
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
      
    case 'CLEAR_SEARCH':
      return { ...state, searchTerm: '' };
      

    // ✅ DETAIL ACTIONS - MỚI THÊM
    case 'FETCH_DETAIL_INIT':
      return { 
        ...state, 
        isDetailLoading: true, 
        detailError: null 
      };
      
    default:
      return state;
  }
};

// Initial state
const initialState: FilesState = {
  files: [],
  selectedFile: null, 
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
const FilesStateContext = React.createContext<FilesState | undefined>(undefined);
const FilesDispatchContext = React.createContext<React.Dispatch<FileAction> | undefined>(undefined);

interface FilesProviderProps {
  children: React.ReactNode;
  debounceDelay?: number;
}

export const FilesProvider: React.FC<FilesProviderProps> = ({ 
  children, 
  debounceDelay = 300 
}) => {
  const [state, dispatch] = React.useReducer(filesReducer, initialState);

  return (
    <FilesStateContext.Provider value={state}>
      <FilesDispatchContext.Provider value={dispatch}>
        {children}
      </FilesDispatchContext.Provider>
    </FilesStateContext.Provider>
  );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useFilesState = (): FilesState => {
  const context = React.useContext(FilesStateContext);
  if (context === undefined) {
    throw new Error('useFilesState must be used within a FilesProvider');
  }
  return context;
};

export const useFilesDispatch = (): React.Dispatch<FileAction> => {
  const context = React.useContext(FilesDispatchContext);
  if (context === undefined) {
    throw new Error('useFilesDispatch must be used within a FilesProvider');
  }
  return context;
};

export const useFilesActions = (debounceDelay: number = 300) => {
  const state = useFilesState();
  const dispatch = useFilesDispatch();

  // ✅ Sử dụng refs để track state và prevent unnecessary calls
  const currentTableStateRef = React.useRef<TableState | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = React.useRef(false);
  const lastFetchParamsRef = React.useRef<string>('');

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

  // CRUD actions
  const addFile = React.useCallback(async (newFileData: Omit<Files, 'id' | 'status'>) => {
    dispatch({ type: 'SET_ACTION_LOADING', payload: true });
    try {
      const newFile = await uploadFile(newFileData);
      dispatch({ type: 'ADD_SUCCESS', payload: newFile });
      dispatch({ type: 'SET_ACTION_LOADING', payload: false });
      return newFile;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: message });
      return null;
    }
  }, [dispatch]);

  return {
    ...state,

    addFile,

  };
};

export const useFilesData = () => {
  const state = useFilesState();
  
  return {
    files: state.files,
    isLoading: state.isLoading,
    isActionLoading: state.isActionLoading,
    error: state.error,
    totalCount: state.totalCount,
    hasMore: state.hasMore,
    searchTerm: state.searchTerm,
    isSearching: state.searchTerm.trim().length > 0,
  };
};

export const useFilesDetail = () => {
  const state = useFilesState();

  return {
    selectedFile: state.selectedFile,
    isDetailLoading: state.isDetailLoading,
    detailError: state.detailError,
  };
};