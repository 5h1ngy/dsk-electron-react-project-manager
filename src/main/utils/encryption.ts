import crypto from 'crypto';

// Encryption key (in a real app, this should be securely stored or derived from a secure source)
const ENCRYPTION_KEY = 'your-secure-encryption-key-32-chars';  
const ENCRYPTION_IV = crypto.randomBytes(16);

/**
 * Encrypts a string using AES-256-CBC
 * @param text - The text to encrypt
 * @returns The encrypted text in Base64 format
 */
export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), ENCRYPTION_IV);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  // Include IV with the encrypted data (prefixed)
  return ENCRYPTION_IV.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a string that was encrypted with AES-256-CBC
 * @param encryptedText - The encrypted text with IV prefix
 * @returns The decrypted string
 */
export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedData = textParts[1];
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Encrypt sensitive data for database storage
 * @param data - Data to be encrypted
 * @returns Encrypted data in Base64 format
 */
export function encryptSensitiveData(data: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), ENCRYPTION_IV);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Decrypt sensitive data from database
 * @param encryptedData - Encrypted data in Base64 format
 * @returns Decrypted data
 */
export function decryptSensitiveData(encryptedData: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), ENCRYPTION_IV);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
