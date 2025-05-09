import { api } from "@/lib/api-client";

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  id: number;
  access_token: string;
  refresh_token: string;
}

export interface DecodedToken {
  id: number;
  identifier: string;
  role: string;
  iat: number;
  exp: number;
}

export const AuthService = {
  /**
   * Login user with credentials
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.auth.login(credentials);
    const tokenData = response.data;

    // Save tokens automatically after login
    AuthService.saveTokens(tokenData);

    return tokenData;
  },

  /**
   * Register a new user
   */
  register: async (userData: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.auth.register(userData);
    const tokenData = response.data;

    // Save tokens automatically after registration
    AuthService.saveTokens(tokenData);

    return tokenData;
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (token: string): Promise<AuthResponse> => {
    const response = await api.auth.refresh(token);
    const tokenData = response.data;

    // Save tokens automatically after refresh
    AuthService.saveTokens(tokenData);

    return tokenData;
  },

  /**
   * Save tokens from API response
   */
  saveTokens: (response: AuthResponse): void => {
    // Store tokens in localStorage
    localStorage.setItem("accessToken", response.access_token);
    localStorage.setItem("refreshToken", response.refresh_token);
    localStorage.setItem("userId", response.id.toString());

    // Update auth header for future requests
    api.apiClient.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;

    // Try to extract and save user info from JWT
    try {
      const userInfo = AuthService.decodeToken(response.access_token);
      if (userInfo) {
        localStorage.setItem("userRole", userInfo.role);
        localStorage.setItem("userIdentifier", userInfo.identifier);
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
    }
  },

  /**
   * Decode JWT token to extract user information
   */
  decodeToken: (token: string): DecodedToken | null => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  /**
   * Remove auth tokens from localStorage
   */
  clearTokens: (): void => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userIdentifier");

    // Remove auth header
    delete api.apiClient.defaults.headers.common.Authorization;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem("accessToken");
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken: (): string | null => {
    return localStorage.getItem("refreshToken");
  },

  /**
   * Get user ID
   */
  getUserId: (): number | null => {
    const id = localStorage.getItem("userId");
    return id ? Number.parseInt(id, 10) : null;
  },

  /**
   * Get user role
   */
  getUserRole: (): string | null => {
    return localStorage.getItem("userRole");
  },

  /**
   * Get user identifier (email)
   */
  getUserIdentifier: (): string | null => {
    return localStorage.getItem("userIdentifier");
  },

  /**
   * Get user information
   */
  getUserInfo: () => {
    return {
      id: AuthService.getUserId(),
      identifier: AuthService.getUserIdentifier(),
      role: AuthService.getUserRole(),
    };
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token: string): boolean => {
    try {
      const decoded = AuthService.decodeToken(token);
      if (!decoded) return true;

      // Get current time in seconds
      const currentTime = Math.floor(Date.now() / 1000);

      // Check if token is expired
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  },

  /**
   * Check if current token is expired
   */
  isCurrentTokenExpired: (): boolean => {
    const token = AuthService.getAccessToken();
    if (!token) return true;
    return AuthService.isTokenExpired(token);
  },
};
