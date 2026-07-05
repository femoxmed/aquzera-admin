export type AuthUser = {
  id: string;
  email: string;
  role: string;
  fullName?: string;
};

const TOKEN_KEY = "aquzera_token";
const USER_KEY = "aquzera_user";

export const authStore = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  },
  getRole() {
    return this.getUser()?.role ?? null;
  },
  setSession(token: string, user: AuthUser) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};
