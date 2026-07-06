export interface ICryptoService {
  encrypt(text: string): string;
  decrypt(cipherText: string): string;
  encryptCredentials(creds: any): any;
  decryptCredentials(creds: any): any;
}
