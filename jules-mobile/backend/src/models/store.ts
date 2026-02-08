export interface User {
  id: string;
  username: string;
  plan: 'free' | 'pro';
}

export interface VM {
  id: string;
  userId: string;
  name: string;
  type: 'local' | 'cloud'; // 'local' = user provided, 'cloud' = provided by us
  host: string;
  port: number;
  username: string;
  privateKey?: string;
  password?: string;
}

export const users: User[] = [
  { id: '1', username: 'demo_user', plan: 'free' }
];

export const vms: VM[] = [];
