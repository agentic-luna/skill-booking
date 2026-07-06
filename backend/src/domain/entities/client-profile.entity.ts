export interface ClientProfile {
  id: string;
  userId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  preferences?: any;
  createdAt: Date;
  updatedAt: Date;
}
