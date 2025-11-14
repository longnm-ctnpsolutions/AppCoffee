import type { Client } from '@/features/clients/types/client.types';
import { apiCall } from '@/lib/response-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const data = await apiCall<{ value: Client[] }>(`${API_BASE_URL}/clients`, {
    method: 'GET',
  });
  return data.value;
};

export const createClient = async (
  newClientData: Omit<Client, 'id' | 'status'>
): Promise<Client> => {
  return await apiCall<Client>(`${API_BASE_URL}/clients`, {
    method: 'POST',
    body: JSON.stringify(newClientData),
  });
};

export const accessClient = async (clientId: string): Promise<any> => {
  const data = await apiCall<any>(`${API_BASE_URL}/clients/access?clientId=${clientId}`, {
    method: 'GET',
  });
  return data;
};

export const updateClient = async (
  clientId: string,
  updateData: UpdateClientData
): Promise<Client> => {
  return await apiCall<Client>(`${API_BASE_URL}/clients/${clientId}`, {
    method: 'PUT',
    body: JSON.stringify({
      id: clientId,
      name: updateData.name,
      audience: updateData.audience,
      issuer: updateData.issuer,
      tokenExpired: updateData.tokenExpired,
      description: updateData.description,
      logoUrl: updateData.logoUrl,
      callbackUrl: updateData.callbackUrl,
      logoutUrl: updateData.logoutUrl,
      homePageUrl: updateData.homePageUrl,
    }),
  });
};

export const deleteClient = async (clientId: string): Promise<void> => {
  await apiCall<void>(`${API_BASE_URL}/clients/${clientId}`, {
    method: 'DELETE',
  });
};

export const deleteMultipleClients = async (clientIds: string[]): Promise<void> => {
  await Promise.all(
    clientIds.map(async (id) => {
      await apiCall<void>(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });
    })
  );
};

export const updateClientStatus = async (clientId: string, status: number): Promise<Client> => {
  return await apiCall<Client>(`${API_BASE_URL}/clients/${clientId}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      id: clientId,
      status: status,
    }),
  });
};

export const getClientById = async (clientId: string): Promise<Client> => {
  return await apiCall<Client>(`${API_BASE_URL}/clients/${clientId}`, {
    method: "GET",
  });
};