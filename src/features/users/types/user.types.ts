
export type User = {
  id: string;
  email: string;
  status: 1 | 0 | 'active' | 'inactive';
  connection: 'Email' | 'Google' | 'SAML' | 'Database';
};
