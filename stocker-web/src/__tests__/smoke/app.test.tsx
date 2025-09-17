import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

// Basic smoke test to verify test infrastructure
describe('Smoke Tests', () => {
  it('should run a basic test', () => {
    expect(true).toBe(true)
  })

  it('should render without crashing', () => {
    const TestComponent = () => <div>Test Component</div>
    
    const { getByText } = render(
      <BrowserRouter>
        <TestComponent />
      </BrowserRouter>
    )
    
    expect(getByText('Test Component')).toBeInTheDocument()
  })
})