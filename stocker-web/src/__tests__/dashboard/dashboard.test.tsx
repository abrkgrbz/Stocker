import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockApiSuccess } from '@/test-utils/test-helpers'
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = axios as any

// Simple Dashboard component for testing
const Dashboard = () => {
  const [stats, setStats] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [selectedPeriod, setSelectedPeriod] = React.useState('month')

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`/api/dashboard/stats?period=${selectedPeriod}`)
        if (response && response.data) {
          setStats(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedPeriod])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div role="main" aria-label="Dashboard">
      <h1>Dashboard</h1>
      
      <div role="group" aria-label="Period selector">
        <button 
          onClick={() => setSelectedPeriod('day')}
          aria-pressed={selectedPeriod === 'day'}
        >
          Daily
        </button>
        <button 
          onClick={() => setSelectedPeriod('week')}
          aria-pressed={selectedPeriod === 'week'}
        >
          Weekly
        </button>
        <button 
          onClick={() => setSelectedPeriod('month')}
          aria-pressed={selectedPeriod === 'month'}
        >
          Monthly
        </button>
      </div>

      <section aria-label="Statistics">
        <div className="stats-grid">
          <div className="stat-card" role="region" aria-label="Total Sales">
            <h2>Total Sales</h2>
            <p className="stat-value">{stats?.totalSales || '0'}</p>
            <span className="stat-change" aria-label="Change from last period">
              {stats?.salesChange || '0'}%
            </span>
          </div>
          
          <div className="stat-card" role="region" aria-label="Active Users">
            <h2>Active Users</h2>
            <p className="stat-value">{stats?.activeUsers || '0'}</p>
            <span className="stat-change">
              {stats?.usersChange || '0'}%
            </span>
          </div>
          
          <div className="stat-card" role="region" aria-label="Revenue">
            <h2>Revenue</h2>
            <p className="stat-value">${stats?.revenue || '0'}</p>
            <span className="stat-change">
              {stats?.revenueChange || '0'}%
            </span>
          </div>
          
          <div className="stat-card" role="region" aria-label="Conversion Rate">
            <h2>Conversion Rate</h2>
            <p className="stat-value">{stats?.conversionRate || '0'}%</p>
            <span className="stat-change">
              {stats?.conversionChange || '0'}%
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Recent Activities">
        <h2>Recent Activities</h2>
        <ul role="list">
          {stats?.recentActivities?.map((activity: any, index: number) => (
            <li key={index} role="listitem">
              <span>{activity.user}</span> - {activity.action}
              <time dateTime={activity.timestamp}>
                {new Date(activity.timestamp).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

describe('Dashboard Tests', () => {
  const mockDashboardData = {
    totalSales: 15420,
    salesChange: 12.5,
    activeUsers: 328,
    usersChange: -5.2,
    revenue: 48500,
    revenueChange: 18.3,
    conversionRate: 3.8,
    conversionChange: 0.5,
    recentActivities: [
      {
        user: 'John Doe',
        action: 'Created new invoice',
        timestamp: '2025-01-17T10:30:00Z',
      },
      {
        user: 'Jane Smith',
        action: 'Updated customer profile',
        timestamp: '2025-01-17T09:15:00Z',
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dashboard Rendering', () => {
    it('should render dashboard with loading state initially', () => {
      renderWithProviders(<Dashboard />)
      
      expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument()
    })

    it('should render all dashboard statistics after loading', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockDashboardData })
      
      renderWithProviders(<Dashboard />)

      // Wait for loading to disappear
      await waitFor(() => {
        expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Now check the content
      expect(screen.getByRole('main', { name: /dashboard/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument()

      // Check statistics cards
      expect(screen.getByRole('region', { name: /total sales/i })).toBeInTheDocument()
      expect(screen.getByText('15420')).toBeInTheDocument()
      expect(screen.getByText('12.5%')).toBeInTheDocument()

      expect(screen.getByRole('region', { name: /active users/i })).toBeInTheDocument()
      expect(screen.getByText('328')).toBeInTheDocument()
      expect(screen.getByText('-5.2%')).toBeInTheDocument()

      expect(screen.getByRole('region', { name: /revenue/i })).toBeInTheDocument()
      expect(screen.getByText('$48500')).toBeInTheDocument()
      expect(screen.getByText('18.3%')).toBeInTheDocument()

      expect(screen.getByRole('region', { name: /conversion rate/i })).toBeInTheDocument()
      expect(screen.getByText('3.8%')).toBeInTheDocument()
      expect(screen.getByText('0.5%')).toBeInTheDocument()
    })

    it('should render recent activities section', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDashboardData })
      
      renderWithProviders(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /recent activities/i })).toBeInTheDocument()
        expect(screen.getByText(/john doe/i)).toBeInTheDocument()
        expect(screen.getByText(/created new invoice/i)).toBeInTheDocument()
        expect(screen.getByText(/jane smith/i)).toBeInTheDocument()
        expect(screen.getByText(/updated customer profile/i)).toBeInTheDocument()
      })
    })
  })

  describe('Period Selection', () => {
    it('should have period selector buttons', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDashboardData })
      
      renderWithProviders(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByRole('group', { name: /period selector/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument()
      })
    })

    it('should update data when period is changed', async () => {
      const monthlyData = { ...mockDashboardData, totalSales: 15420 }
      const dailyData = { ...mockDashboardData, totalSales: 520 }
      
      mockedAxios.get
        .mockResolvedValueOnce({ data: monthlyData }) // Initial load
        .mockResolvedValueOnce({ data: dailyData })   // After clicking Daily

      renderWithProviders(<Dashboard />)
      const user = userEvent.setup()

      await waitFor(() => {
        expect(screen.getByText('15420')).toBeInTheDocument()
      })

      const dailyButton = screen.getByRole('button', { name: /daily/i })
      await user.click(dailyButton)

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/dashboard/stats?period=day')
        expect(screen.getByText('520')).toBeInTheDocument()
      })
    })

    it('should indicate active period selection', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDashboardData })
      
      renderWithProviders(<Dashboard />)

      await waitFor(() => {
        const monthlyButton = screen.getByRole('button', { name: /monthly/i })
        expect(monthlyButton).toHaveAttribute('aria-pressed', 'true')
        
        const dailyButton = screen.getByRole('button', { name: /daily/i })
        expect(dailyButton).toHaveAttribute('aria-pressed', 'false')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))
      
      renderWithProviders(<Dashboard />)

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to fetch stats',
          expect.any(Error)
        )
      })

      consoleError.mockRestore()
    })

    it('should show zero values when data is missing', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} })
      
      renderWithProviders(<Dashboard />)

      await waitFor(() => {
        const statValues = screen.getAllByText('0')
        expect(statValues.length).toBeGreaterThan(0)
        expect(screen.getByText('$0')).toBeInTheDocument()
        expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all sections', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDashboardData })
      
      renderWithProviders(<Dashboard />)

      await waitFor(() => {
        expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Dashboard')
        expect(screen.getByLabelText('Statistics')).toBeInTheDocument()
        expect(screen.getByLabelText('Recent Activities')).toBeInTheDocument()
        expect(screen.getByLabelText('Period selector')).toBeInTheDocument()
      })
    })

    it('should have proper semantic HTML structure', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockDashboardData })
      
      const { container } = renderWithProviders(<Dashboard />)

      await waitFor(() => {
        expect(screen.queryByText(/loading dashboard/i)).not.toBeInTheDocument()
      })
      
      const main = container.querySelector('[role="main"]')
      const sections = container.querySelectorAll('section')
      const h1 = container.querySelector('h1')
      const h2s = container.querySelectorAll('h2')
      
      expect(main).toBeInTheDocument()
      expect(sections.length).toBe(2)
      expect(h1).toBeInTheDocument()
      expect(h2s.length).toBeGreaterThan(0)
    })
  })
})