export class TokenManager {
  private storageKey: string;

  constructor(storageKey: string = 'wookoon-cas-token') {
    this.storageKey = storageKey;
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.storageKey);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, token);
  }

  clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}