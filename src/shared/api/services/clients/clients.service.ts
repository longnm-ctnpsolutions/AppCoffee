
import type { Client } from '@/features/clients/types/client.types';

const mockClients: Client[] = Array.from({ length: 20 }, (_, i) => ({
    id: `client-${i + 1}`,
    name: `Client thứ ${i + 1}`,
    description: `Mô tả cho client ${i + 1}`,
    homePageUrl: `http://client${i+1}.com`,
    audience: `aud-client-${i+1}`,
    issuer: `iss-client-${i+1}`,
    tokenExpired: 3600,
    logoUrl: `/images/new-icon.png`,
    status: i % 3 === 0 ? 0 : 1,
    clientId: `id-${i+1}`,
    identifier: `identifier-${i+1}`
}));

export type UpdateClientData = {
  id: string;
  name?: string;
  audience: string;
  issuer: string;
  tokenExpired: number | string;
  description?: string | null;
  homePageUrl?: string | null;
  logoUrl?: string | null;
  callbackUrl?: string | null;
  logoutUrl?: string | null;
  clientId?: string;
  status?: number | string;
  identifier?: string;
};

export const getClients = async (): Promise<Client[]> => {
  console.log("Mocking getClients");
  return new Promise(resolve => setTimeout(() => resolve([...mockClients]), 300));
};

export const createClient = async (
  newClientData: Omit<Client, 'id' | 'status'>
): Promise<Client> => {
   console.log("Mocking createClient", newClientData);
   return new Promise(resolve => {
        setTimeout(() => {
            const newClient: Client = {
                id: `client-${Date.now()}`,
                status: 1,
                ...newClientData
            };
            mockClients.unshift(newClient);
            resolve(newClient);
        }, 500);
   });
};

export const accessClient = async (clientId: string): Promise<any> => {
    console.log("Mocking accessClient", clientId);
    return new Promise(resolve => setTimeout(() => resolve({ accessToken: 'mock-access-token-for-' + clientId, callbackUrl: 'http://localhost:3000' }), 300));
};

export const updateClient = async (
  clientId: string,
  updateData: UpdateClientData
): Promise<Client> => {
    console.log("Mocking updateClient", clientId, updateData);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockClients.findIndex(c => c.id === clientId);
            if (index !== -1) {
                mockClients[index] = { ...mockClients[index], ...updateData };
                resolve(mockClients[index]);
            } else {
                reject(new Error("Client not found"));
            }
        }, 500);
    });
};

export const deleteClient = async (clientId: string): Promise<void> => {
  console.log("Mocking deleteClient", clientId);
  return new Promise(resolve => setTimeout(() => {
      const index = mockClients.findIndex(c => c.id === clientId);
      if (index !== -1) {
          mockClients.splice(index, 1);
      }
      resolve();
  }, 500));
};

export const deleteMultipleClients = async (clientIds: string[]): Promise<void> => {
  console.log("Mocking deleteMultipleClients", clientIds);
   return new Promise(resolve => setTimeout(() => {
      clientIds.forEach(id => {
          const index = mockClients.findIndex(c => c.id === id);
          if (index !== -1) {
              mockClients.splice(index, 1);
          }
      });
      resolve();
  }, 500));
};

export const updateClientStatus = async (clientId: string, status: number): Promise<Client> => {
  console.log("Mocking updateClientStatus", clientId, status);
   return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockClients.findIndex(c => c.id === clientId);
            if (index !== -1) {
                mockClients[index].status = status;
                resolve(mockClients[index]);
            } else {
                reject(new Error("Client not found"));
            }
        }, 500);
    });
};

export const getClientById = async (clientId: string): Promise<Client> => {
   console.log("Mocking getClientById", clientId);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const client = mockClients.find(c => c.id === clientId);
            if (client) {
                resolve(client);
            } else {
                reject(new Error("Client not found"));
            }
        }, 300);
    });
};
