"use client";

import { AddUser, User, UserFormData } from "../../features/users/types/user.types";
import {
    getUsersByFieldWithOData,
    getUsersWithOData,
    UsersQueryResult,
} from "../api/services/users/users-odata.service";
import { TableState } from "../types/odata.types";
import {
    createUser,
    deleteMultipleUsers,
    deleteUser,
    getUserById,
    getUsers,
    updateUser,
    updateUserPassword,
    updateUserStatus,
    // updateUserStatus,
} from "../api/services/users/users.service";
import React from "react";
import { useToast } from "../hooks/use-toast";
import { useRouter } from "next/navigation";

interface UsersState {
    users: User[];
    selectedUser: User | null;
    allUsers: User[];
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
type UsersAction =
    | { type: "FETCH_INIT"; }
    | { type: "FETCH_SUCCESS"; payload: UsersQueryResult; }
    | { type: "FETCH_FAILURE"; payload: string; }
    | { type: 'FETCH_ALL_INIT'; }
    | { type: 'FETCH_ALL_SUCCESS'; payload: User[]; }        // thêm
    | { type: 'FETCH_ALL_FAILURE'; payload: string; }
    | { type: "ADD_SUCCESS"; payload: User; }
    | { type: "REMOVE_SUCCESS"; payload: { id: string; }; }
    | { type: "REMOVE_MULTIPLE_SUCCESS"; payload: { ids: string[]; }; }
    | { type: "SET_ACTION_LOADING"; payload: boolean; }
    | { type: "SET_ERROR"; payload: string | null; }
    | { type: "SET_SEARCH_TERM"; payload: string; }
    | { type: "CLEAR_SEARCH"; }
    | { type: "UPDATE_STATUS_SUCCESS"; payload: { userId: string; newStatus: boolean }; }
    | { type: "UPDATE_USER_SUCCESS"; payload: { user: User; }; }
    | { type: "FETCH_DETAIL_INIT"; }
    | { type: "FETCH_DETAIL_SUCCESS"; payload: User; }
    | { type: "FETCH_DETAIL_FAILURE"; payload: string; }
    | { type: "CLEAR_SELECTED_USER"; };

// Reducer
const usersReducer = (state: UsersState, action: UsersAction): UsersState => {
    switch (action.type) {
        case "FETCH_INIT":
            return { ...state, isLoading: true, error: null };

        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                users: action.payload.users,
                totalCount: action.payload.totalCount,
                hasMore: action.payload.hasMore,
            };

        case "FETCH_FAILURE":
            return { ...state, isLoading: false, error: action.payload };

        case "ADD_SUCCESS":
            return {
                ...state,
                users: [action.payload, ...state.users],
                totalCount: state.totalCount + 1,
            };

        case "REMOVE_SUCCESS":
            return {
                ...state,
                users: state.users.filter(
                    (user) => user.id !== action.payload.id
                ),
                totalCount: state.totalCount - 1,
                isActionLoading: false,
                selectedUser:
                    state.selectedUser?.id === action.payload.id
                        ? null
                        : state.selectedUser,
            };

        case "REMOVE_MULTIPLE_SUCCESS":
            return {
                ...state,
                users: state.users.filter(
                    (user) => !action.payload.ids.includes(user.id)
                ),
                totalCount: state.totalCount - action.payload.ids.length,
                isActionLoading: false,
                selectedUser:
                    state.selectedUser &&
                        action.payload.ids.includes(state.selectedUser.id)
                        ? null
                        : state.selectedUser,
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

        case "UPDATE_STATUS_SUCCESS":
            return {
                ...state,
                users: state.users.map((user) =>
                    user.id === action.payload.userId
                        ? { ...user, lockoutEnabled: action.payload.newStatus }
                        : user
                ),
                selectedUser:
                    state.selectedUser?.id === action.payload.userId
                        ? { ...state.selectedUser, lockoutEnabled: action.payload.newStatus }
                        : state.selectedUser,
                isActionLoading: false,
            };

        case "UPDATE_USER_SUCCESS":
            return {
                ...state,
                users: state.users.map((user) =>
                    user.id === action.payload.user.id
                        ? { ...user, ...action.payload.user }
                        : user
                ),
                selectedUser:
                    state.selectedUser?.id === action.payload.user.id
                        ? { ...state.selectedUser, ...action.payload.user }
                        : state.selectedUser,
                isActionLoading: false,
            };

        // ✅ DETAIL ACTIONS - MỚI THÊM
        case "FETCH_DETAIL_INIT":
            return {
                ...state,
                isDetailLoading: true,
                detailError: null,
            };

        case "FETCH_DETAIL_SUCCESS":
            return {
                ...state,
                isDetailLoading: false,
                selectedUser: action.payload,
                detailError: null,
            };

        case "FETCH_DETAIL_FAILURE":
            return {
                ...state,
                isDetailLoading: false,
                detailError: action.payload,
                selectedUser: null,
            };

        case "CLEAR_SELECTED_USER":
            return {
                ...state,
                selectedUser: null,
                detailError: null,
                isDetailLoading: false,
            };

        case 'FETCH_ALL_INIT':
            return { ...state, isAllLoading: true, error: null };

        case 'FETCH_ALL_SUCCESS':
            return { ...state, isAllLoading: false, allUsers: action.payload };

        case 'FETCH_ALL_FAILURE':
            return { ...state, isAllLoading: false, error: action.payload };

        default:
            return state;
    }
};

const initialState: UsersState = {
    users: [],
    selectedUser: null,
    allUsers: [],
    isAllLoading: false,
    isLoading: false,
    isActionLoading: false,
    isDetailLoading: false,
    error: null,
    detailError: null,
    totalCount: 0,
    hasMore: false,
    searchTerm: "",
};

// TÁCH RIÊNG STATE VÀ DISPATCH CONTEXTS
const UsersStateContext = React.createContext<UsersState | undefined>(
    undefined
);
const UsersDispatchContext = React.createContext<
    React.Dispatch<UsersAction> | undefined
>(undefined);

// Provider props
interface UsersProviderProps {
    children: React.ReactNode;
    debounceDelay?: number;
}

export const UsersProvider: React.FC<UsersProviderProps> = ({
    children,
    debounceDelay = 300,
}) => {
    const [state, dispatch] = React.useReducer(usersReducer, initialState);

    return (
        <UsersStateContext.Provider value={state}>
            <UsersDispatchContext.Provider value={dispatch}>
                {children}
            </UsersDispatchContext.Provider>
        </UsersStateContext.Provider>
    );
};

// HOOKS ĐỂ ACCESS RIÊNG BIỆT STATE VÀ DISPATCH
export const useUsersState = (): UsersState => {
    const context = React.useContext(UsersStateContext);
    if (context === undefined) {
        throw new Error("useUsersState must be used within a UsersProvider");
    }
    return context;
};

export const useUsersDispatch = (): React.Dispatch<UsersAction> => {
    const context = React.useContext(UsersDispatchContext);
    if (context === undefined) {
        throw new Error("useUsersDispatch must be used within a UsersProvider");
    }
    return context;
};

// ✅ CUSTOM HOOK VỚI BUSINESS LOGIC - ĐÃ FIX DOUBLE API CALLS
export const useUsersActions = (debounceDelay: number = 300) => {
    const state = useUsersState();
    const dispatch = useUsersDispatch();
    const { toast } = useToast();
    const router = useRouter();

    // ✅ Sử dụng refs để track state và prevent unnecessary calls
    const currentTableStateRef = React.useRef<TableState | null>(null);
    const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isInitializedRef = React.useRef(false);
    const lastFetchParamsRef = React.useRef<string>("");

    // ✅ Stable fetch function với ref để prevent recreation
    const fetchUsersInternal = React.useCallback(
        async (tableState: TableState, searchQuery: string) => {
            // ✅ Prevent duplicate calls bằng cách compare parameters
            const currentParams = JSON.stringify({ tableState, searchQuery });
            if (lastFetchParamsRef.current === currentParams) {
                console.log("🚫 Duplicate API call prevented");
                return;
            }

            console.log("🔥 fetchusersInternal called with:", {
                tableState,
                searchQuery,
            });
            lastFetchParamsRef.current = currentParams;

            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await getUsersWithOData(tableState, searchQuery);
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

    const fetchUsersByField = React.useCallback(
        async (field: string, searchQuery: string) => {
            try {
                const result = await getUsersByFieldWithOData(
                    field,
                    searchQuery
                );
                return result;
            } catch (error) {
                console.error(error);
                return null;
            }
        },
        []
    );

    // ✅ Main fetch function - CHỈ update ref, KHÔNG trigger search effect
    const fetchUsers = React.useCallback(
        async (tableState: TableState) => {
            console.log("📋 fetchUsers called");

            // Clear existing timeout
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }

            // Update ref KHÔNG trigger re-render
            currentTableStateRef.current = tableState;

            // ✅ Call immediately cho non-search requests
            await fetchUsersInternal(tableState, state.searchTerm);
        },
        [fetchUsersInternal, state.searchTerm]
    );

    // ✅ SINGLE useEffect cho debounced search - CHỈ handle search term changes
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
            fetchUsersInternal(currentTableStateRef.current!, state.searchTerm);
        }, debounceDelay);

        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current);
            }
        };
    }, [state.searchTerm, fetchUsersInternal, debounceDelay]);

    // ✅ Initialization effect - CHỈ chạy 1 lần
    React.useEffect(() => {
        if (!isInitializedRef.current) {
            isInitializedRef.current = true;
            console.log("✅ usersActions initialized");
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


    const fetchAllUsers = React.useCallback(async () => {
        dispatch({ type: 'FETCH_ALL_INIT' });
        try {
            const data = await getUsers();
            dispatch({ type: 'FETCH_ALL_SUCCESS', payload: data });
        } catch (err) {
            dispatch({ type: 'FETCH_ALL_FAILURE', payload: (err as Error).message });
        }
    }, [fetchUsersInternal, dispatch]);

    // CRUD actions
    const addUser = React.useCallback(
        async (newUserData: AddUser) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });
            try {
                const newUser = await createUser(newUserData);
                await fetchAllUsers()
                dispatch({ type: "ADD_SUCCESS", payload: newUser });
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
                toast({
                    title: "Success",
                    description: "User created successfully!",
                    variant: "default",
                });
                router.push(`/vi/users/${newUser}`);
                return true;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                dispatch({ type: "SET_ERROR", payload: message });
                return false;
            }
        },
        [dispatch]
    );

    const removeUser = React.useCallback(
        async (userId: string) => {
            const originalState = { ...state };
            dispatch({ type: "REMOVE_SUCCESS", payload: { id: userId } });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await deleteUser(userId);
                await fetchAllUsers()
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
                return true;
            } catch (error) {
                dispatch({
                    type: "FETCH_SUCCESS",
                    payload: {
                        users: originalState.users,
                        totalCount: originalState.totalCount,
                        hasMore: originalState.hasMore,
                    },
                });
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                dispatch({ type: "SET_ERROR", payload: message });
                return false;
            }
        },
        [state, dispatch]
    );

    const removeMultipleUsers = React.useCallback(
        async (userIds: string[]) => {
            const originalState = { ...state };
            dispatch({
                type: "REMOVE_MULTIPLE_SUCCESS",
                payload: { ids: userIds },
            });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                await deleteMultipleUsers(userIds);
                await fetchAllUsers()
                dispatch({ type: "SET_ACTION_LOADING", payload: false });
                return true;
            } catch (error) {
                dispatch({
                    type: "FETCH_SUCCESS",
                    payload: {
                        users: originalState.users,
                        totalCount: originalState.totalCount,
                        hasMore: originalState.hasMore,
                    },
                });
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                dispatch({ type: "SET_ERROR", payload: message });
                return false;
            }
        },
        [state, dispatch]
    );

    const updateStatus = React.useCallback(async (user: User, newStatus: boolean) => {
        dispatch({
            type: "UPDATE_STATUS_SUCCESS",
            payload: { userId: user.id, newStatus: !newStatus },
        });
        dispatch({ type: 'SET_ACTION_LOADING', payload: true });

        try {
            await updateUserStatus(user.id, newStatus);
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });

            toast({
                title: "Success",
                description: `User ${user.email} ${newStatus ? "activated" : "deactivated"}!`,
                variant: "default",
            });

            return true;
        } catch (error) {
            // Rollback
            dispatch({
                type: "UPDATE_STATUS_SUCCESS",
                payload: { userId: user.id, newStatus: !newStatus },
            });
            dispatch({ type: 'SET_ACTION_LOADING', payload: false });

            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: message });
            return false;
        }
    }, [state.users, state.selectedUser, dispatch]);

    // ✅ Thêm user detail actions
    const fetchUserById = React.useCallback(
        async (userId: string) => {
            dispatch({ type: "FETCH_DETAIL_INIT" });

            try {
                const user = await getUserById(userId);
                dispatch({ type: "FETCH_DETAIL_SUCCESS", payload: user });
                return user;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";
                dispatch({ type: "FETCH_DETAIL_FAILURE", payload: message });
                throw error;
            }
        },
        [dispatch]
    );

    const clearSelectedUser = React.useCallback(() => {
        dispatch({ type: "CLEAR_SELECTED_USER" });
    }, [dispatch]);

    // ✅ Get user from cache hoặc fetch
    const getUserDetails = React.useCallback(
        async (userId: string) => {
            // Kiểm tra xem user đã có trong cache chưa
            const cachedUser = state.users.find((user) => user.id === userId);

            if (cachedUser) {
                // Nếu có trong cache, dùng luôn
                dispatch({ type: "FETCH_DETAIL_SUCCESS", payload: cachedUser });
                return cachedUser;
            }

            // Nếu không có, fetch từ API
            return await fetchUserById(userId);
        },
        [state.users, fetchUserById, dispatch]
    );

    // ✅ NEW: Update user Action
    const updateUserData = React.useCallback(
        async (userId: string, updateData: Omit<UserFormData, "id">) => {
            // ✅ Tìm user trong cả users array VÀ selectedUser
            const originalUser =
                state.users.find((user) => user.id === userId) ||
                (state.selectedUser?.id === userId ? state.selectedUser : null);

            if (!originalUser) {
                dispatch({ type: "SET_ERROR", payload: "user not found" });
                return false;
            }

            // Optimistic update - cập nhật UI ngay lập tức
            const optimisticUser: User = {
                ...originalUser,
                ...updateData,
            };

            dispatch({
                type: "UPDATE_USER_SUCCESS",
                payload: { user: optimisticUser },
            });
            dispatch({ type: "SET_ACTION_LOADING", payload: true });

            try {
                // Call API với full UpdateUserData
                const fullUpdateData: UserFormData = {
                    id: userId,
                    ...updateData,
                };

                const updatedUser = await updateUser(userId, fullUpdateData);

                // Update với data thật từ server
                dispatch({
                    type: "UPDATE_USER_SUCCESS",
                    payload: { user: updatedUser },
                });
                dispatch({ type: "SET_ACTION_LOADING", payload: false });

                toast({
                    title: "Success",
                    description: "User details updated successfully!",
                    variant: "default",
                });

                console.log("✅ user updated successfully:", updatedUser);
                return true;
            } catch (error: any) {
                // Rollback về trạng thái ban đầu
                dispatch({
                    type: "UPDATE_USER_SUCCESS",
                    payload: { user: originalUser },
                });
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unknown error occurred";

                toast({
                    title: 'Error',
                    description: message,
                    variant: 'destructive',
                });

                console.error("❌ Update user failed:", error);
                return false;
            }
        },
        [state.users, state.selectedUser, dispatch]
    );

    const updatePassword = React.useCallback(
        async (userId: string, password: string) => {
            dispatch({ type: "SET_ACTION_LOADING", payload: true });
            try {
                // Call API với full UpdateUserData
                const dataUpdate = { userId: userId, password: password || "" };

                await updateUserPassword(userId, dataUpdate);

                toast({
                    title: "Success",
                    description: "User password updated successfully!",
                    variant: "default",
                });

                return true;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Password change failed";

                dispatch({ type: "SET_ERROR", payload: errorMessage });

                toast({
                    title: 'Error',
                    description: errorMessage,
                    variant: 'destructive',
                });
                return false;
            }
        }, [state.users, state.selectedUser, dispatch]
    );

    return {
        // State (for easy access)
        ...state,

        // Search
        setSearchTerm,
        clearSearch,
        isSearching,

        // Actions
        fetchUsersByField,
        fetchAllUsers,
        fetchUsers,
        addUser,
        removeUser,
        removeMultipleUsers,
        updateStatus,
        updateUserData,
        updatePassword,

        // ✅ Detail actions
        fetchUserById,
        getUserDetails,
        clearSelectedUser,
    };
};

// CONVENIENCE HOOK CHO NHỮNG COMPONENT CHỈ CẦN READ STATE
export const useUsersData = () => {
    const state = useUsersState();

    return {
        users: state.users,
        isLoading: state.isLoading,
        allUsers: state.allUsers,
        isAllLoading: state.isAllLoading,
        isActionLoading: state.isActionLoading,
        error: state.error,
        totalCount: state.totalCount,
        hasMore: state.hasMore,
        searchTerm: state.searchTerm,
        isSearching: state.searchTerm.trim().length > 0,
    };
};

export const useUserDetail = () => {
    const state = useUsersState();

    return {
        selectedUser: state.selectedUser,
        isDetailLoading: state.isDetailLoading,
        detailError: state.detailError,
    };
};
