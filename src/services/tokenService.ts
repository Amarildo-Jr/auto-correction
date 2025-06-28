import axios from 'axios';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: any;
}

class TokenService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      // Tentar carregar do novo formato primeiro
      let accessToken = localStorage.getItem('accessToken');
      let refreshToken = localStorage.getItem('refreshToken');
      let expiresAt = localStorage.getItem('tokenExpiresAt');

      // Se não encontrar no novo formato, tentar no formato antigo
      if (!accessToken) {
        accessToken = localStorage.getItem('token');
      }

      if (accessToken && refreshToken && expiresAt) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = parseInt(expiresAt);
      }
    } catch (error) {
      console.error('Erro ao carregar tokens do storage:', error);
      this.clearTokens();
    }
  }

  private saveTokensToStorage(tokenData: TokenData) {
    if (typeof window === 'undefined') return;

    try {
      // Salvar no novo formato
      localStorage.setItem('accessToken', tokenData.accessToken);
      localStorage.setItem('refreshToken', tokenData.refreshToken);
      localStorage.setItem('tokenExpiresAt', tokenData.expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(tokenData.user));

      // Salvar também no formato antigo para compatibilidade
      localStorage.setItem('token', tokenData.accessToken);

      // Salvar em cookies para o middleware - usar data de expiração mais longa
      const expiryDate = new Date(tokenData.expiresAt);
      // Garantir que os cookies tenham configuração adequada para produção e desenvolvimento
      const isSecure = window.location.protocol === 'https:';
      const cookieOptions = `path=/; expires=${expiryDate.toUTCString()}; ${isSecure ? 'secure; ' : ''}samesite=lax`;
      
      // Definir cookies individualmente para garantir que sejam salvos
      document.cookie = `token=${tokenData.accessToken}; ${cookieOptions}`;
      document.cookie = `userRole=${tokenData.user.role}; ${cookieOptions}`;
      document.cookie = `refreshToken=${tokenData.refreshToken}; ${cookieOptions}`;

      // Forçar atualização dos valores internos
      this.accessToken = tokenData.accessToken;
      this.refreshToken = tokenData.refreshToken;
      this.expiresAt = tokenData.expiresAt;

      console.log('Tokens salvos com sucesso:', {
        hasAccessToken: !!tokenData.accessToken,
        userRole: tokenData.user.role,
        expiresAt: new Date(tokenData.expiresAt).toLocaleString()
      });
    } catch (error) {
      console.error('Erro ao salvar tokens no storage:', error);
    }
  }

  public clearTokens() {
    if (typeof window === 'undefined') return;

    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    this.refreshPromise = null;

    // Limpar localStorage (ambos os formatos)
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Token antigo

    // Limpar cookies
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public getRefreshToken(): string | null {
    return this.refreshToken;
  }

  public isTokenExpired(): boolean {
    if (!this.accessToken || !this.expiresAt) return true;
    
    // Considerar token expirado se restam menos de 5 minutos
    const bufferTime = 5 * 60 * 1000; // 5 minutos em ms
    return Date.now() > (this.expiresAt - bufferTime);
  }

  public hasValidToken(): boolean {
    return !!this.accessToken && !this.isTokenExpired();
  }

  public async setTokens(loginResponse: any): Promise<void> {
    const { token, refresh_token, user, expires_in } = loginResponse;
    
    // Calcular tempo de expiração (expires_in em segundos)
    const expiresAt = Date.now() + (expires_in * 1000);

    const tokenData: TokenData = {
      accessToken: token,
      refreshToken: refresh_token,
      expiresAt,
      user
    };

    this.saveTokensToStorage(tokenData);
  }

  public async refreshAccessToken(): Promise<string> {
    // Se já há uma promise de refresh em andamento, retornar ela
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = this.performTokenRefresh();
    
    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/refresh`,
        {
          refresh_token: this.refreshToken
        }
      );

      const { token, refresh_token, user, expires_in } = response.data;
      
      // Atualizar tokens
      await this.setTokens({
        token,
        refresh_token,
        user,
        expires_in
      });

      return token;
    } catch (error: any) {
      console.error('Erro ao renovar token:', error);
      
      // Se o refresh token também expirou, limpar tudo
      if (error.response?.status === 401 || error.response?.status === 403) {
        this.clearTokens();
        
        // Redirecionar para login se estiver no browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      throw error;
    }
  }

  public async getValidAccessToken(): Promise<string | null> {
    // Se o token ainda é válido, retornar ele
    if (this.hasValidToken()) {
      return this.accessToken;
    }

    // Se não há refresh token, não pode renovar
    if (!this.refreshToken) {
      return null;
    }

    try {
      // Tentar renovar o token
      return await this.refreshAccessToken();
    } catch (error) {
      console.error('Erro ao obter token válido:', error);
      return null;
    }
  }

  public shouldRefreshSoon(): boolean {
    if (!this.accessToken || !this.expiresAt) return false;
    
    // Renovar se restam menos de 10 minutos
    const bufferTime = 10 * 60 * 1000; // 10 minutos em ms
    return Date.now() > (this.expiresAt - bufferTime);
  }

  public async refreshIfNeeded(): Promise<void> {
    if (this.shouldRefreshSoon() && this.refreshToken) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        console.error('Erro ao renovar token automaticamente:', error);
      }
    }
  }
}

// Criar uma instância singleton
const tokenService = new TokenService();

// Exportar como default para uso consistente
export default tokenService; 