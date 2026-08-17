import { AuthConfig, StandardUser } from '../types';
import { TokenManager } from './token-manager';

export class AuthClient {
  private config: Required<AuthConfig>;
  private tokenManager: TokenManager;

  constructor(config: AuthConfig) {
    this.config = {
      storageKey: 'wookoon-cas-token',
      autoFetchUser: true,
      ...config,
    };
    this.tokenManager = new TokenManager(this.config.storageKey);
  }

  /**
   * 获取当前存储的 Token
   */
  getAccessToken(): string | null {
    return this.tokenManager.getToken();
  }

  /**
   * 跳转到后端 Auth Service 提供的登录页 (最终会跳转到 Casdoor)
   */
  login(redirectUri: string): void {
    const url = new URL('/api/cas/login-auto', this.config.authServerUrl);
    url.searchParams.set('redirect_uri', redirectUri);
    window.location.href = url.toString();
  }

  /**
   * 处理 Casdoor 回调，用 code 换取 Token
   */
  async handleCallback(code: string, state: string): Promise<StandardUser> {
    const url = new URL('/api/cas/callback', this.config.authServerUrl);
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || '登录回调处理失败');
    }

    const data = await response.json();
    
    // 假设后端返回 { token: '...', user: {...} }
    if (data.token) {
      this.tokenManager.setToken(data.token);
    }

    return data.user;
  }

  /**
   * 获取当前登录用户信息
   */
  async fetchUser(): Promise<StandardUser | null> {
    const token = this.getAccessToken();
    if (!token) return null;

    const url = new URL('/api/cas/me', this.config.authServerUrl);
    
    try {
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        this.logout();
        return null;
      }

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  /**
   * 跳转到后端提供的个人资料页
   */
  async profile(): Promise<void> {
    const url = new URL('/api/cas/me-auto', this.config.authServerUrl);
    // window.location.href = url.toString();
    window.open(url.toString(), '_blank')
  }

  /**
   * 登出
   */
  logout(): void {
    // 调用后端 /api/cas/logout 接口清除服务端 Session

    const token = this.getAccessToken();
    if (!token) return;

    const url = new URL('/api/cas/logout', this.config.authServerUrl);
    
    try {
      fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      }).finally(() => {
        this.tokenManager.clearToken();
      });
    } catch {
      this.tokenManager.clearToken();
    }
  }
}