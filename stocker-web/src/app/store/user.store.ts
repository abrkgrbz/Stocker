import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  tenantId?: string;
  tenantName?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      setProfile: (profile) =>
        set(() => ({
          profile,
          error: null,
        })),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates }
            : null,
        })),

      clearProfile: () =>
        set(() => ({
          profile: null,
          error: null,
        })),

      setLoading: (isLoading) =>
        set(() => ({ isLoading })),

      setError: (error) =>
        set(() => ({ error })),
    }),
    {
      name: 'user-store',
    }
  )
);