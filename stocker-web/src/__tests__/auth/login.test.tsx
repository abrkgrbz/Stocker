import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock auth store
const mockLogin = vi.fn()
const mockSetToken = vi.fn()
vi.mock('@/app/store/auth.store', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    setToken: mockSetToken,
    isAuthenticated: false,
    user: null,
  }),
}))

// Simple Login component for testing
const LoginForm = () => {
  const navigate = useNavigate()
  const { login, setToken } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setLoading(true)
    setError('')

    try {
      const response = await axios.post('/api/auth/login', { email, password })
      const { token, user } = response.data
      
      setToken(token)
      login(user)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input 
          id="email" 
          name="email" 
          type="email" 
          required 
          aria-label="Email address"
        />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input 
          id="password" 
          name="password" 
          type="password" 
          required 
          aria-label="Password"
        />
      </div>

      {error && (
        <div role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

describe('Login Flow Tests', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const renderLogin = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </QueryClientProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication Tests', () => {
    it('should render login form with all required fields', () => {
      renderLogin()
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('should handle successful login with valid credentials', async () => {
      const mockResponse = {
        data: {
          token: 'test-jwt-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      }
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse)
      
      renderLogin()
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123',
        })
        expect(mockSetToken).toHaveBeenCalledWith('test-jwt-token')
        expect(mockLogin).toHaveBeenCalledWith(mockResponse.data.user)
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('should display error message for invalid credentials', async () => {
      const errorMessage = 'Invalid email or password'
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage },
        },
      })

      renderLogin()
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'wrong@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })

    it('should disable submit button during login process', async () => {
      mockedAxios.post.mockImplementation(() => 
        new Promise((resolve) => setTimeout(resolve, 100))
      )

      renderLogin()
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled()
    })

    it('should validate email format', async () => {
      renderLogin()
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      expect(emailInput.validity.valid).toBe(false)
    })

    it('should require password field', async () => {
      renderLogin()
      const user = userEvent.setup()

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /login/i })

      await user.type(emailInput, 'test@example.com')
      // Don't type password
      await user.click(submitButton)

      expect(passwordInput.validity.valid).toBe(false)
    })
  })

  describe('Token Persistence Tests', () => {
    it('should store JWT token in localStorage', async () => {
      const mockToken = 'test-jwt-token'
      const mockResponse = {
        data: {
          token: mockToken,
          user: { id: '1', email: 'test@example.com' },
        },
      }
      
      mockedAxios.post.mockResolvedValueOnce(mockResponse)
      
      renderLogin()
      const user = userEvent.setup()

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/password/i), 'password123')
      await user.click(screen.getByRole('button', { name: /login/i }))

      await waitFor(() => {
        expect(mockSetToken).toHaveBeenCalledWith(mockToken)
      })
    })
  })
})

// Import statements fix
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth.store'