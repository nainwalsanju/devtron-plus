export interface User {
  id: string;
  username: string;
  plan: 'free' | 'pro';
}

export interface VM {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  host: string;
  username: string;
  port: number;
}

export type CreateVMData = Omit<VM, 'id'>;
