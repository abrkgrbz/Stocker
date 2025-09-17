import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { BrowserRouter } from 'react-router-dom'

// Extend matchers
expect.extend(toHaveNoViolations)

// Mock components for testing
const LoginForm = () => (
  <form>
    <label htmlFor="email">Email</label>
    <input id="email" type="email" name="email" required />
    
    <label htmlFor="password">Password</label>
    <input id="password" type="password" name="password" required />
    
    <button type="submit">Login</button>
  </form>
)

const Dashboard = () => (
  <main role="main">
    <h1>Dashboard</h1>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/reports">Reports</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
    <section aria-labelledby="stats-heading">
      <h2 id="stats-heading">Statistics</h2>
      <div role="region" aria-label="Sales statistics">
        <p>Total Sales: $10,000</p>
      </div>
    </section>
  </main>
)

describe('Accessibility Tests', () => {
  it('Login form should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('Dashboard should have no accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})