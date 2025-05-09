import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "@/lib/api-client";

interface User {
  id: number | string;
  identifier?: string;
  email?: string;
  name?: string;
  role?: string;
}

interface AuthTokenResponse {
  id: number;
  access_token: string;
  refresh_token: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  setUser: (user: User) => void;
  getAccessToken: () => string | null;
  saveTokens: (response: AuthTokenResponse) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (identifier: string, password: string) => {
        set({ isLoading: true });

        try {
          const response = await api.auth.login({ identifier, password });

          // Handle the token response
          get().saveTokens(response.data);
          return true;
        } catch (error) {
          console.error("Login failed:", error);
          set({ isLoading: false });
          return false;
        }
      },

      saveTokens: (response: AuthTokenResponse) => {
        const { id, access_token, refresh_token } = response;

        // Create a user object from the response
        const user: User = {
          id,
          // Extract additional user info from JWT if needed
          // For now, just use the ID
        };

        // Update auth headers for future requests
        api.apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;

        set({
          accessToken: access_token,
          refreshToken: refresh_token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        // Try to extract user info from JWT
        try {
          const payload = JSON.parse(atob(access_token.split(".")[1]));
          if (payload) {
            const updatedUser = {
              ...user,
              identifier: payload.identifier,
              role: payload.role,
            };
            set({ user: updatedUser });
          }
        } catch (e) {
          console.error("Failed to parse JWT:", e);
        }
      },

      logout: () => {
        // Remove auth header
        delete api.apiClient.defaults.headers.common.Authorization;

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshTokens: async () => {
        const currentRefreshToken = get().refreshToken;

        if (!currentRefreshToken) {
          return false;
        }

        try {
          const response = await api.auth.refresh(currentRefreshToken);

          // Handle the token response - it might be in the same format
          const { access_token, refresh_token } = response.data;

          // Update auth header
          api.apiClient.defaults.headers.common.Authorization = `Bearer ${access_token}`;

          set({
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
          });

          return true;
        } catch (error) {
          console.error("Token refresh failed:", error);
          // If refresh fails, log the user out
          get().logout();
          return false;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      getAccessToken: () => {
        return get().accessToken;
      },
    }),
    {
      name: "auth-storage", // name of the item in storage
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({
        // Only persist these fields
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth header from persisted store
if (typeof window !== "undefined") {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    api.apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }
}
