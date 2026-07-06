export interface HostBankDetail {
  id: string;
  hostProfileId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string | null;
  updatedAt: Date;
}
