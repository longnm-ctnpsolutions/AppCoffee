
import type { Client } from "@/features/clients/types/client.types";

const mockClients: Client[] = Array.from({ length: 20 }, (_, i) => ({
    id: `client-${i + 1}`,
    name: `Client thứ ${i + 1}`,
    description: `Mô tả cho client ${i + 1}`,
    homePageUrl: `http://client${i+1}.com`,
    audience: `aud-client-${i+1}`,
    issuer: `iss-client-${i+1}`,
    tokenExpired: 3600,
    logoUrl: `/images/new-icon.svg`,
    status: i % 3 === 0 ? 0 : 1,
    clientId: `id-${i+1}`,
    identifier: `identifier-${i+1}`
}));

export interface ClientsQueryResult {
    clients: Client[];
    totalCount: number;
    hasMore: boolean;
}

const applyFilteringAndSorting = (clients: Client[], tableState: any, searchTerm?: string): Client[] => {
     let filteredData = [...clients];

    if (searchTerm) {
        const lowercasedFilter = searchTerm.toLowerCase();
        filteredData = filteredData.filter(client =>
            client.name?.toLowerCase().includes(lowercasedFilter) ||
            client.description?.toLowerCase().includes(lowercasedFilter)
        );
    }
    
    // Column filters
    tableState.columnFilters.forEach((filter: {id: string, value: any}) => {
        if(filter.id === 'status' && filter.value !== undefined) {
             filteredData = filteredData.filter(client => String(client.status) === String(filter.value));
        }
        // Add other column filters here if needed
    });


    // Sắp xếp
    if (tableState.sorting.length > 0) {
        const sorter = tableState.sorting[0];
        filteredData.sort((a, b) => {
            const valA = (a as any)[sorter.id] || '';
            const valB = (b as any)[sorter.id] || '';
            if (valA < valB) return sorter.desc ? 1 : -1;
            if (valA > valB) return sorter.desc ? -1 : 1;
            return 0;
        });
    }

    return filteredData;
}


export const getClientsWithOData = async (
    tableState: any,
    searchTerm?: string
): Promise<ClientsQueryResult> => {
     console.log("Mocking getClientsWithOData", { tableState, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
            const filteredData = applyFilteringAndSorting(mockClients, tableState, searchTerm);
            const pageIndex = tableState.pagination.pageIndex;
            const pageSize = tableState.pagination.pageSize;
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            const paginatedData = filteredData.slice(start, end);

            resolve({
                clients: paginatedData,
                totalCount: filteredData.length,
                hasMore: end < filteredData.length,
            });
        }, 500);
    });
};

export const getClientsByFieldWithOData = async (
    field?: string,
    searchTerm?: string | string[]
): Promise<ClientsQueryResult> => {
    console.log("Mocking getClientsByFieldWithOData", { field, searchTerm });
     return new Promise(resolve => {
        setTimeout(() => {
             let results = mockClients;
            if (field && searchTerm) {
                 results = mockClients.filter(client => {
                    const clientField = (client as any)[field];
                    if (Array.isArray(searchTerm)) {
                        return searchTerm.includes(clientField);
                    }
                    return clientField === searchTerm;
                });
            }
            resolve({
                clients: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};

export const searchClientsByFieldWithOData = async (
    field?: string,
    searchTerm?: string
): Promise<ClientsQueryResult> => {
     console.log("Mocking searchClientsByFieldWithOData", { field, searchTerm });
      return new Promise(resolve => {
        setTimeout(() => {
             let results = mockClients;
            if (field && searchTerm) {
                 results = mockClients.filter(client => {
                    const clientField = (client as any)[field];
                    return clientField?.toLowerCase().includes(searchTerm.toLowerCase());
                });
            }
            resolve({
                clients: results,
                totalCount: results.length,
                hasMore: false,
            });
        }, 300);
    });
};
