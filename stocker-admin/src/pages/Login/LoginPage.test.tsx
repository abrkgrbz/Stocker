import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuthStore } from '../../stores/authStore';
import { loginRateLimiter } from '../../utils/security';

// Mock modules
vi.mock('../../stores/authStore');
vi.mock('../../utils/security', () => ({
  loginRateLimiter: {
    isAllowed: vi.fn(() => true),
  },
  validateEmail: vi.fn((email) => email.includes('@')),
  validatePassword: vi.fn((password) => password.length >= 8),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  const mockLogin = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as any).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
    });
  });

  it('should render login form', () => {
    renderLoginPage();
    
    expect(screen.getByText(/stocker admin panel/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('should show remember me checkbox', () => {
    renderLoginPage();
    
    expect(screen.getByText(/beni hatırla/i)).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i);
    const passwordInput = screen.getByPlaceholderText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@test.com', 'Password123!');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('should show error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));
    
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i);
    const passwordInput = screen.getByPlaceholderText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i);
    const passwordInput = screen.getByPlaceholderText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await userEvent.type(emailInput, 'invalidemail');
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should require minimum password length', async () => {
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i);
    const passwordInput = screen.getByPlaceholderText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'short');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should show loading state during login', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
    
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i);
    const passwordInput = screen.getByPlaceholderText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/giriş yapılıyor/i)).toBeInTheDocument();
  });

  it('should handle rate limiting', async () => {
    (loginRateLimiter.isAllowed as any).mockReturnValue(false);
    
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i);
    const passwordInput = screen.getByPlaceholderText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/çok fazla deneme/i)).toBeInTheDocument();
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should toggle password visibility', async () => {
    renderLoginPage();
    
    const passwordInput = screen.getByPlaceholderText(/şifre/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /toggle password/i });
    
    expect(passwordInput.type).toBe('password');
    
    await userEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    
    await userEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should navigate to dashboard if already authenticated', () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
    });
    
    renderLoginPage();
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should clear form on successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage();
    
    const emailInput = screen.getByPlaceholderText(/e-posta/i) as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText(/şifre/i) as HTMLInputElement;
    
    await userEvent.type(emailInput, 'admin@test.com');
    await userEvent.type(passwordInput, 'Password123!');
    
    expect(emailInput.value).toBe('admin@test.com');
    expect(passwordInput.value).toBe('Password123!');
    
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(emailInput.value).toBe('');
      expect(passwordInput.value).toBe('');
    });
  });
});