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
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted text format');
    }
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
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
}
