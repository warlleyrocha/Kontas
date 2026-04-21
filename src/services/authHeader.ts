import { getItemAsync } from "expo-secure-store";

import { AUTH_TOKEN_STORAGE_KEY } from "./storageKeys";

let authorizationHeader: string | null = null;
let authorizationHeaderHydrationPromise: Promise<void> | null = null;
let isAuthorizationHeaderHydrated = false;

function applyAuthorizationHeader(token: string | null) {
  authorizationHeader = token ? `Bearer ${token}` : null;
}

export function getAuthorizationHeader() {
  return authorizationHeader;
}

export function hasAuthorizationHeader() {
  return Boolean(authorizationHeader);
}

export async function hydrateAuthorizationHeader() {
  if (isAuthorizationHeaderHydrated) {
    return;
  }

  if (!authorizationHeaderHydrationPromise) {
    authorizationHeaderHydrationPromise = (async () => {
      const token = await getItemAsync(AUTH_TOKEN_STORAGE_KEY);
      applyAuthorizationHeader(token);
      isAuthorizationHeaderHydrated = true;
    })().finally(() => {
      authorizationHeaderHydrationPromise = null;
    });
  }

  await authorizationHeaderHydrationPromise;
}

export function setAuthorizationHeader(token: string) {
  applyAuthorizationHeader(token);
  isAuthorizationHeaderHydrated = true;
}

export function clearAuthorizationHeader() {
  applyAuthorizationHeader(null);
  isAuthorizationHeaderHydrated = true;
}
