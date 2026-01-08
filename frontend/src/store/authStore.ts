import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// Load from localStorage on init
const loadAuth = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { user: null, token: null };
      }
    }
  }
  return { user: null, token: null };
};

const saveAuth = (state: AuthState) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-storage', JSON.stringify(state));
  }
};

const initialState = loadAuth();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setAuth: (user, token) => {
    const newState = { user, token };
    saveAuth(newState);
    set(newState);
  },
  logout: () => {
    const newState = { user: null, token: null };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
    }
    set(newState);
  },
}));
