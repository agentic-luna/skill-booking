"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeCryptoService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const environment_1 = require("../../config/environment");
const ALGORITHM = 'aes-256-cbc';
let KEY;
try {
    KEY = Buffer.from(environment_1.env.ENCRYPTION_KEY, 'hex');
    if (KEY.length !== 32) {
        KEY = crypto_1.default.scryptSync(environment_1.env.ENCRYPTION_KEY, 'salt', 32);
    }
}
catch (e) {
    KEY = crypto_1.default.scryptSync(environment_1.env.ENCRYPTION_KEY, 'salt', 32);
}
class NodeCryptoService {
    encrypt(text) {
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(ALGORITHM, KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    decrypt(encryptedText) {
        const [ivHex, encrypted] = encryptedText.split(':');
        if (!ivHex || !encrypted) {
            throw new Error('Invalid encrypted text format');
        }
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto_1.default.createDecipheriv(ALGORITHM, KEY, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    encryptCredentials(creds) {
        const serialized = JSON.stringify(creds);
        const encrypted = this.encrypt(serialized);
        return { encrypted };
    }
    decryptCredentials(credsObj) {
        if (!credsObj || typeof credsObj !== 'object' || !credsObj.encrypted) {
            return credsObj;
        }
        const decrypted = this.decrypt(credsObj.encrypted);
        return JSON.parse(decrypted);
    }
}
exports.NodeCryptoService = NodeCryptoService;
