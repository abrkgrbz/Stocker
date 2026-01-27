const TOKEN_KEY = 'stocker_master_token';
const REFRESH_TOKEN_KEY = 'stocker_master_refresh_token';

export const tokenStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    clearToken: () => localStorage.removeItem(TOKEN_KEY),

    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
    clearRefreshToken: () => localStorage.removeItem(REFRESH_TOKEN_KEY),

    clearAll: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
};
