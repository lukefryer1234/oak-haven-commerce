export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  password: string;
  createdAt: Date;
  updatedAt: Date;
} 