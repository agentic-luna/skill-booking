export interface AdminProfile {
  id: string;
  userId: string;
  department?: string | null;
  adminLevel: number;
  lastLoginIp?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
