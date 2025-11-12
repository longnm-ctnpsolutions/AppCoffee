import type { Client } from '@/features/clients/types/client.types';
import { clients as mockClients } from '@/features/clients/lib/data';

const API_BASE_URL = 'https://api.identity.dev.ctnp.com';

const MOCK_API_DELAY = 500;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

const getMockClients = async (): Promise<Client[]> => {
  console.log('Fetching mock clients...');
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockClients);
    }, MOCK_API_DELAY);
  });
};

const createMockClient = async (newClientData: Omit<Client, 'id' | 'status'>): Promise<Client> => {
    console.log('Creating mock client...', newClientData);
    const newClient: Client = {
        id: `client-${Date.now()}`,
        status: 1,
        ...newClientData,
    };
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(newClient);
        }, MOCK_API_DELAY);
    });
};

const deleteMockClient = async (clientId: string): Promise<{ id: string }> => {
    console.log(`Deleting mock client with id: ${clientId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ id: clientId });
        }, MOCK_API_DELAY);
    });
};

const deleteMultipleMockClients = async (clientIds: string[]): Promise<{ ids: string[] }> => {
    console.log(`Deleting mock clients with ids: ${clientIds.join(', ')}`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ ids: clientIds });
        }, MOCK_API_DELAY);
    });
};


// --- REAL API FUNCTIONS ---
// These would be used in production to call a real backend.
// Note: These are examples and will not work without a real API endpoint.

export const getClients = async (): Promise<Client[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('API call failed, falling back to mock data:', error);
    return await getMockClients();
  }
};

export const createClient = async (newClientData: Omit<Client, 'id' | 'status'>): Promise<Client> => {
  // Using mock for now
  return createMockClient(newClientData);
  // const response = await fetch(`${API_BASE_URL}/users`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(newClientData),
  // });
  // return handleResponse<Client>(response);
};

export const deleteClient = async (clientId: string): Promise<{ id: string }> => {
  // Using mock for now
  return deleteMockClient(clientId);
  // const response = await fetch(`${API_BASE_URL}/users/${clientId}`, {
  //   method: 'DELETE',
  // });
  // return handleResponse<{ id: string }>(response);
};

export const deleteMultipleClients = async (clientIds: string[]): Promise<{ ids: string[] }> => {
  // Using mock for now
  return deleteMultipleMockClients(clientIds);
  // const response = await fetch(`${API_BASE_URL}/users/batch-delete`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ ids: clientIds }),
  // });
  // return handleResponse<{ ids: string[] }>(response);
};
