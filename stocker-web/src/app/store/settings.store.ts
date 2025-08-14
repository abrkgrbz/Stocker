import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  borderRadius: number;
  fontSize: number;
}

interface LayoutSettings {
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  headerHeight: number;
  showBreadcrumb: boolean;
  showFooter: boolean;
}

interface GeneralSettings {
  language: 'tr' | 'en';
  dateFormat: string;
  timeFormat: '12h' | '24h';
  currency: string;
  pageSize: number;
}

interface SettingsState {
  theme: ThemeSettings;
  layout: LayoutSettings;
  general: GeneralSettings;
  
  updateTheme: (theme: Partial<ThemeSettings>) => void;
  updateLayout: (layout: Partial<LayoutSettings>) => void;
  updateGeneral: (general: Partial<GeneralSettings>) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  resetSettings: () => void;
}

const defaultSettings: Pick<SettingsState, 'theme' | 'layout' | 'general'> = {
  theme: {
    mode: 'light',
    primaryColor: '#667eea',
    borderRadius: 8,
    fontSize: 14,
  },
  layout: {
    sidebarCollapsed: false,
    sidebarWidth: 260,
    headerHeight: 64,
    showBreadcrumb: true,
    showFooter: true,
  },
  general: {
    language: 'tr',
    dateFormat: 'DD.MM.YYYY',
    timeFormat: '24h',
    currency: 'TRY',
    pageSize: 10,
  },
};

export const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({
        ...defaultSettings,

        updateTheme: (theme) =>
          set((state) => ({
            theme: { ...state.theme, ...theme },
          })),

        updateLayout: (layout) =>
          set((state) => ({
            layout: { ...state.layout, ...layout },
          })),

        updateGeneral: (general) =>
          set((state) => ({
            general: { ...state.general, ...general },
          })),

        toggleSidebar: () =>
          set((state) => ({
            layout: {
              ...state.layout,
              sidebarCollapsed: !state.layout.sidebarCollapsed,
            },
          })),

        toggleDarkMode: () =>
          set((state) => ({
            theme: {
              ...state.theme,
              mode: state.theme.mode === 'light' ? 'dark' : 'light',
            },
          })),

        resetSettings: () => set(() => defaultSettings),
      }),
      {
        name: 'settings-store',
        partialize: (state) => ({
          theme: state.theme,
          layout: state.layout,
          general: state.general,
        }),
      }
    ),
    {
      name: 'settings-store',
    }
  )
);