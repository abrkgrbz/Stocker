/// <reference types="vite/client" />

declare global {
  interface Window {
    dayjs?: {
      locale: (locale: string) => void;
    };
    Sentry?: {
      captureException: (error: Error, options?: any) => void;
      captureMessage: (message: string, level?: string) => void;
    };
  }
}

export {};
