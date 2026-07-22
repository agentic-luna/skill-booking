import crypto from 'crypto';
import { ICryptoService } from '../../application/services/crypto.service';
import { env } from '../../config/environment';

const ALGORITHM = 'aes-256-cbc';

let KEY: Buffer;
try {
  KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');
  if (KEY.length !== 32) {
    KEY = crypto.scryptSync(env.ENCRYPTION_KEY, 'salt', 32);
  }
} catch (e) {
  KEY = crypto.scryptSync(env.ENCRYPTION_KEY, 'salt', 32);
}

export class NodeCryptoService implements ICryptoService {
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return encryptedText;
    }
    if (!encryptedText.includes(':')) {
      return encryptedText; // Already plaintext
    }
    try {
      const [ivHex, encrypted] = encryptedText.split(':');
      if (!ivHex || !encrypted) {
        return encryptedText;
      }
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  encryptCredentials(creds: any): any {
    const serialized = JSON.stringify(creds);
    const encrypted = this.encrypt(serialized);
    return { encrypted };
  }

  decryptCredentials(credsObj: any): any {
    if (!credsObj || typeof credsObj !== 'object' || !credsObj.encrypted) {
      return credsObj;
    }
    const decrypted = this.decrypt(credsObj.encrypted);
    return JSON.parse(decrypted);
  }

  decryptBankDetail(bankDetail: any): any {
    if (!bankDetail || typeof bankDetail !== 'object') return bankDetail;
    return {
      ...bankDetail,
      accountHolderName: bankDetail.accountHolderName ? this.decrypt(bankDetail.accountHolderName) : bankDetail.accountHolderName,
      accountNumber: bankDetail.accountNumber ? this.decrypt(bankDetail.accountNumber) : bankDetail.accountNumber,
      ifscCode: bankDetail.ifscCode ? this.decrypt(bankDetail.ifscCode) : bankDetail.ifscCode,
      upiId: bankDetail.upiId ? this.decrypt(bankDetail.upiId) : bankDetail.upiId,
    };
  }

  decryptHostProfile(hostProfile: any): any {
    if (!hostProfile || typeof hostProfile !== 'object') return hostProfile;
    if (hostProfile.bankDetail) {
      return {
        ...hostProfile,
        bankDetail: this.decryptBankDetail(hostProfile.bankDetail),
      };
    }
    return hostProfile;
  }

  decryptHost(host: any): any {
    if (!host || typeof host !== 'object') return host;
    if (host.hostProfile) {
      return {
        ...host,
        hostProfile: this.decryptHostProfile(host.hostProfile),
      };
    }
    return host;
  }
}
