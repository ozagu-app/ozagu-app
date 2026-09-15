// crypto.js — OZAGU end-to-end encryption (PIN-based)
// Full Web Crypto API via @fungible-systems/webcrypto-expo

import { Crypto } from "@fungible-systems/webcrypto-expo";

if (typeof global.crypto === "undefined" || !global.crypto.subtle) {
  global.crypto = new Crypto();
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// ============================================================
// Base64 <-> ArrayBuffer
// ============================================================

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(
      ...bytes.subarray(i, Math.min(i + chunk, bytes.length))
    );
  }
  return btoa(binary);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ============================================================
// Random helpers
// ============================================================

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function generateSalt() {
  return bufferToBase64(randomBytes(16));
}

// ============================================================
// PIN-derived AES key (PBKDF2, 200k iterations)
// ============================================================

async function deriveAesKeyFromPin(pin, saltBase64) {
  const enc = new TextEncoder();
  const pinKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBuffer(saltBase64),
      iterations: 200000,
      hash: "SHA-256",
    },
    pinKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ============================================================
// Identity key pair (ECDH P-256)
// ============================================================

export async function generateIdentityKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey(
    "raw",
    keyPair.publicKey
  );
  const privateKeyPkcs8 = await crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );

  return {
    publicKeyBase64: bufferToBase64(publicKeyRaw),
    privateKeyPkcs8Base64: bufferToBase64(privateKeyPkcs8),
  };
}

// ============================================================
// Wrap / unwrap private key with PIN
// ============================================================

export async function wrapKeyWithPin(privateKeyPkcs8Base64, pin, saltBase64) {
  const aesKey = await deriveAesKeyFromPin(pin, saltBase64);
  const iv = randomBytes(12);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    base64ToBuffer(privateKeyPkcs8Base64)
  );

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  };
}

export async function unwrapKeyWithPin(wrapped, pin, saltBase64) {
  const aesKey = await deriveAesKeyFromPin(pin, saltBase64);

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(wrapped.iv) },
    aesKey,
    base64ToBuffer(wrapped.ciphertext)
  );

  return bufferToBase64(plaintext);
}

// ============================================================
// Recovery code (6-digit)
// ============================================================

export function generateRecoveryCode() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}

// ============================================================
// ECDH shared key between two users
// ============================================================

async function importPrivateKey(pkcs8Base64) {
  return crypto.subtle.importKey(
    "pkcs8",
    base64ToBuffer(pkcs8Base64),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey", "deriveBits"]
  );
}

async function importPublicKey(rawBase64) {
  return crypto.subtle.importKey(
    "raw",
    base64ToBuffer(rawBase64),
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

export async function deriveSharedKey(myPrivateBase64, theirPublicBase64) {
  const myPrivate = await importPrivateKey(myPrivateBase64);
  const theirPublic = await importPublicKey(theirPublicBase64);

  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublic },
    myPrivate,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ============================================================
// Message encryption / decryption
// ============================================================

export async function encryptMessage(plaintext, sharedKey) {
  const iv = randomBytes(12);
  const enc = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    enc.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  };
}

export async function decryptMessage(ciphertextBase64, ivBase64, sharedKey) {
  const dec = new TextDecoder();

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(ivBase64) },
    sharedKey,
    base64ToBuffer(ciphertextBase64)
  );

  return dec.decode(plaintext);
}

// ============================================================
// Group sender key
// ============================================================

export async function generateGroupSenderKey() {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const raw = await crypto.subtle.exportKey("raw", key);
  return bufferToBase64(raw);
}

export async function importGroupKey(rawBase64) {
  return crypto.subtle.importKey(
    "raw",
    base64ToBuffer(rawBase64),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptGroupKeyForMember(
  groupKeyBase64,
  pairwiseSharedKey
) {
  const iv = randomBytes(12);
  const enc = new TextEncoder();

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    pairwiseSharedKey,
    enc.encode(groupKeyBase64)
  );

  return {
    ciphertext: bufferToBase64(ciphertext),
    iv: bufferToBase64(iv),
  };
}

export async function decryptGroupKeyFromMember(encrypted, pairwiseSharedKey) {
  const dec = new TextDecoder();

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(encrypted.iv) },
    pairwiseSharedKey,
    base64ToBuffer(encrypted.ciphertext)
  );

  return dec.decode(plaintext);
}

// ============================================================
// Unlocked private key storage (device-local, secure)
// ============================================================

const LOCAL_KEY = "ozagu_unlocked_private_key";

export async function cachePrivateKey(pkcs8Base64) {
  try {
    await SecureStore.setItemAsync(LOCAL_KEY, pkcs8Base64);
  } catch {
    await AsyncStorage.setItem(LOCAL_KEY, pkcs8Base64);
  }
}

export async function getCachedPrivateKey() {
  try {
    const v = await SecureStore.getItemAsync(LOCAL_KEY);
    if (v) return v;
  } catch {}
  return AsyncStorage.getItem(LOCAL_KEY);
}

export async function clearCachedPrivateKey() {
  try {
    await SecureStore.deleteItemAsync(LOCAL_KEY);
  } catch {}
  await AsyncStorage.removeItem(LOCAL_KEY);
}