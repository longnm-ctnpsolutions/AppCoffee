"use client";

import * as React from "react";
import type { TableState } from "@/types/odata.types";
import { UserRole } from "@/features/users/types/user.types";
import { getUserRolesWithOData, UserRolesQueryResult } from "../api/services/users/users-odata.service";
import { createUserRole } from "@/shared/api/services/users/users.service";
import { deleteUserRoleId, getUserRole } from "../api/services/users/users.service";



interface AddUserRoleRequest {
    email: string;
    description: string;
}

interface UserRolesState {
    userRoles: UserRole[];
    isLoading: boolean;
    allUserRoles: UserRole[];
    isActionLoading: boolean;
    isAllLoading: boolean;
    error: string | null;
    totalCount: number;
    hasMore: boolean;
    searchTerm: string;
    selectedUserRole: UserRole | null;
}

type UserRolesAction =
    | { type: "FETCH_INIT"; }
    | { type: "FETCH_SUCCESS"; payload: UserRolesQueryResult; }
    | { type: "FETCH_FAILURE"; payload: string; }
    | { type: 'FETCH_ALL_INIT' }
    | { type: 'FETCH_ALL_SUCCESS'; payload: UserRole[] }        // thêm
    | { type: 'FETCH_ALL_FAILURE'; payload: string }
    | { type: "ADD_SUCCESS"; payload: UserRole; }
    | { type: "ADD_MANY_SUCCESS"; payload: { ids: string[]; }; }
    | { type: "REMOVE_SUCCESS"; payload: { id: string; }; }
    | { type: "SET_ACTION_LOADING"; payload: boolean; }
    | { type: "SET_ERROR"; payload: string | null; }
    | { type: "SET_SEARCH_TERM"; payload: string; }
    | { type: "CLEAR_SEARCH"; }
    | { type: "CLEAR_SELECTED_CLIENT"; };

const userRolesReducer = (
    state: UserRolesState,
    action: UserRolesAction
): UserRolesState => {
    switch (action.type) {
        case "FETCH_INIT":
            return { ...state, isLoading: true, error: null };

        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                userRoles: action.payload.users,
                totalCount: action.payload.totalCount,
                hasMore: action.payload.hasMore,
            };

        case "FETCH_FAILURE":
            return { ...state, isLoading: false, error: action.payload };

        case "ADD_SUCCESS":
            return {
                ...state,
                userRoles: [action.payload, ...state.userRoles],
                totalCount: state.totalCount + 1,
            };

        case "ADD_MANY_SUCCESS":
            return {
                ...state,
                // filter bỏ những id vừa thêm nếu muốn
                userRoles: state.userRoles.filter(
                    (p) => !action.payload.ids.includes(p.id)
                ),
                totalCount: state.totalCount + action.payload.ids.length,
                isActionLoading: false,
                selectedUserRole:
                    state.selectedUserRole &&
                        action.payload.ids.includes(state.selectedUserRole.id)
                        ? null
                        : state.selectedUserRole,
            };

        case "REMOVE_SUCCESS":
            return {
                ...state,
                userRoles: state.userRoles.filter(
                    (userRole) => userRole.id !== action.payload.id
                ),
                totalCount: state.totalCount - 1,
                isActionLoading: false,
                selectedUserRole:
                    state.selectedUserRole?.id === action.payload.id
                        ? null
                        : state.selectedUserRole,
            };

        case "SET_ACTION_LOADING":
            return { ...state, isActionLoading: action.payload };

        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
                isLoading: false,
                isActionLoading: false,
            };

        case "SET_SEARCH_TERM":
            return { ...state, searchTerm: action.payload };

        case "CLEAR_SEARCH":
            return { ...state, searchTerm: "" };

        case 'FETCH_ALL_INIT':
            return { ...state, isAllLoading: true, error: null };

        case 'FETCH_ALL_SUCCESS':
            return { ...state, isAllLoading: false, allUserRoles: action.payload };

        case 'FETCH_ALL_FAILURE':
            return { ...state, isAllLoading: false, error: action.payload };

        default:
            return state;
    }
};

// Initial state
const initialState: UserRolesState = {
    userRoles: [],
    selectedUserRole: null,
    allUserRoles: [],
    isAllLoading: false,
    isLoading: false,
    isActionLoading: false,
    error: null,
    totalCount: 0,
    hasMore: false,
    searchTerm: "",
};

const UserRolesStateContext = React.createContext<UserRolesState | undefined>(
    undefined
);
const UserRolesDispatchContext = React.createContext<
    React.Dispatch<UserRolesAction> | undefined
>(undefined);

interface PermisionsProviderProps {
    children: React.ReactNode;
    debounceDelay?: number;
}

export const UserRolesProvider: React.FC<PermisionsProviderProps> = ({
    children,
}) => {
    const [state, dispatch] = React.useReducer(userRolesReducer, initialState);

    return (
        <UserRolesStateContext.Provider value={state}>
            <UserRolesDispatchContext.Provider value={dispatch}>
                {children}
            </UserRolesDispatchContext.Provider>
        </UserRolesStateContext.Provider>
    );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useUserRolesState = (): UserRolesState => {
    const context = React.useContext(UserRolesStateContext);
    if (context === undefined) {
        throw new Error(
            "useUserRolesState must be used within a UserRolesProvider"
        );
    }
    return context;
};

export const useUserRolesDispatch = (): React.Dispatch<UserRolesAction> => {
    const context = React.useContext(UserRolesDispatchContext);
    if (context === undefined) {
        throw new Error(
            "useUserRolesDispatch must be used within a UserRolesProvider"
        );
    }
    return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useUserRolesStateActions = (
    userId: string,
    debounceDelay: number = 300
) => {
    const state = useUserRolesState();
    const dispatch = useUserRolesDispatch();

    // Refs để track state và prevent unnecessary calls
    const currentTableStateRef = React.useRef<TableState | null>(null);
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = React.useRef(false);
    const lastFetchParamsRef = React.useRef<string>("");

    // Stable fetch function với ref để prevent recreation
    const fetchUserRolesInternal = React.useCallback(
        async (userId: string, tableState: TableState, searchQuery: string) => {
            // Prevent duplicate calls bằng cách compare parameters
            const currentParams = JSON.stringify({ tableState, searchQuery });
            if (lastFetchParamsRef.current === currentParams) {
                console.log("🚫 Duplicate API call prevented");
                return;
            }

            console.log("🔥 fetchUserRolesInternal called with:", {
                userId,
                tableState,
                searchQuery,
            });
            lastFetchParamsRef.current = currentParams;

            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await getUserRolesWithOData(
                    userId,
                    tableState,
                    searchQuery
                );
                dispatch({ type: "FETCH_SUCCESS", payload: result });
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                dispatch({ type: "FETCH_FAILURE", payload: message });
            } finally {
                // Reset after a short delay để allow cho next legitimate call
                setTimeout(() => {
                    lastFetchParamsRef.current = "";
                }, 100);
            }
        },
        [dispatch]
    );

    // Main fetch function - CHỈ update ref, KHÔNG trigger search effect
    const fetchUserRoles = React.useCallback(
        async (userId: string, tableState: TableState) => {
            console.log("📋 fetchUserRoles called");

            // Clear existing timeout
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            // Update ref KHÔNG trigger re-render
            currentTableStateRef.current = tableState;

            // Call immediately cho non-search requests
            await fetchUserRolesInternal(userId, tableState, state.searchTerm);
        },
        [fetchUserRolesInternal, state.searchTerm]
    );

    // Main fetch function - CHỈ update ref, KHÔNG trigger search effect

    const fetchAllUserRoles = React.useCallback(async () => {
          dispatch({ type: 'FETCH_ALL_INIT' });
          try {
            const data = await getUserRole(userId);
            dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
          } catch (err) {
            dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
          }
    }, [fetchUserRolesInternal, dispatch]);

    const addUserRoleAction = React.useCallback(
        async (roleIds: string[]) => {
            console.log("➕ Adding roleUser:", userId);
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                const isCreateUserRole = await createUserRole(userId, roleIds);
                await fetchAllUserRoles()
                dispatch({
                    type: "ADD_MANY_SUCCESS",
                    payload: { ids: roleIds },
                });
                console.log("✅ UserRole added successfully:");

                if (currentTableStateRef.current) {
                    await fetchUserRolesInternal(
                        userId,
                        currentTableStateRef.current,
                        state.searchTerm
                    );
                }

                if (!isCreateUserRole) {
                    return false;
                }

                return true;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to add roleUser";
                dispatch({ type: "SET_ERROR", payload: message });
                console.error("❌ Add roleUser failed:", error);
                throw error;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [userId, dispatch, fetchUserRolesInternal, state.searchTerm]
    );

    // ✅ DELETE PERMISSION ACTION
    const deleteUserRoleAction = React.useCallback(
        async (userRoleId: string) => {
            console.log("🗑️ Deleting userRole:", userRoleId);
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await deleteUserRoleId(userId, userRoleId);
                await fetchAllUserRoles()
                dispatch({
                    type: "REMOVE_SUCCESS",
                    payload: { id: userRoleId },
                });
                console.log("✅ UserRole deleted successfully:", userRoleId);
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "Failed to delete roleUser";
                dispatch({ type: "SET_ERROR", payload: message });
                console.error("❌ Delete roleUser failed:", error);
                throw error;
            } finally {
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
            }
        },
        [userId, dispatch]
    );

    // SINGLE useEffect cho debounced search - CHỈ handle search term changes
    React.useEffect(() => {
        // Skip nếu chưa có table state hoặc chưa initialized
        if (!currentTableStateRef.current || !isInitializedRef.current) return;

        console.log(
            "🔍 Search term changed, setting up debounce:",
            state.searchTerm
        );

        // Clear existing timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current);
        }

        // Set up debounced search
        fetchTimeoutRef.current = setTimeout(() => {
            console.log("🔍 Debounced search triggered:", state.searchTerm);
            fetchUserRolesInternal(
                userId,
                currentTableStateRef.current!,
                state.searchTerm
            );
        }, debounceDelay);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [state.searchTerm, fetchUserRolesInternal, debounceDelay, userId]);

    // Initialization effect - CHỈ chạy 1 lần
    React.useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            console.log("✅ RoleUsersActions initialized");
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
    const setSearchTerm = React.useCallback(
        (term: string) => {
            console.log("🔍 Setting search term:", term);
            dispatch({ type: "SET_SEARCH_TERM", payload: term });
        },
        [dispatch]
    );

    const clearSearch = React.useCallback(() => {
        dispatch({ type: "CLEAR_SEARCH" });
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
        fetchUserRoles,
        fetchAllUserRoles,
        addUserRoleAction,
        deleteUserRoleAction,
    };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useRoleUsersData = () => {
    const state = useUserRolesState();

    return {
        userRoles: state.userRoles,
        allUserRoles: state.allUserRoles,
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