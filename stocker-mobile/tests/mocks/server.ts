import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// Utility function to use custom handlers in specific tests
export const useHandlers = (...customHandlers: Parameters<typeof server.use>) => {
  server.use(...customHandlers);
};

// Reset handlers to defaults
export const resetHandlers = () => {
  server.resetHandlers();
};
