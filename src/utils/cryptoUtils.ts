/**
 * Cryptographic security utilities for zero-plaintext verification
 */

// One-way cryptographic SHA-256 hashes of authorized committee credentials
export const AUTHORIZED_CREDENTIAL_HASHES: readonly string[] = [
  'b3152ebe9e7ee740b993b25719fa2ca19e7707791001dacb0d510faa9debb348',
  '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c',
  '56a2cfc1434d6b61350288d76d5d003f2918b97e17560196a4d8ee03b3ed1cda',
  'c68a4be0357a69451431803304389099a5b8e87c56de0f4a6b42c5fcd77ad1ca',
] as const;

/**
 * Computes the SHA-256 cryptographic hash of a given string
 */
export async function computeSha256(message: string): Promise<string> {
  const clean = message.trim();
  if (!clean) return '';
  const msgBuffer = new TextEncoder().encode(clean);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies if the provided text matches any authorized one-way cryptographic hash
 */
export async function verifyCredentialHash(input: string): Promise<boolean> {
  const hash = await computeSha256(input);
  if (!hash) return false;
  return AUTHORIZED_CREDENTIAL_HASHES.includes(hash);
}
