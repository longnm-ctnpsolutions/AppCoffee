
export type Client = {
  id: string;
  name: string;
  clientId: string;
  status: 1 | 0;
  logo?: string;
  description?: string;
};

export type Permission = {
  permission: string;
  description: string;
};