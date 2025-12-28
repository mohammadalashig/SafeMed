import { render } from '@testing-library/react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const spinner = container.querySelector('.w-4.h-4')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.querySelector('.w-12.h-12')
    expect(spinner).toBeInTheDocument()
  })
})

