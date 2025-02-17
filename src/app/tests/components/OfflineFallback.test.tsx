import OfflineFallback from '@/app/components/OfflineFallback'
import { render, screen, fireEvent } from '@testing-library/react'

describe('OfflineFallback', () => {
  it('renders offline message correctly', () => {
    render(<OfflineFallback />)
    
    expect(screen.getByText(/no internet connection/i)).toBeInTheDocument()
    expect(screen.getByText(/please check your network connection/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument()
  })

  it('reloads page when retry button is clicked', () => {
    const reloadMock = jest.fn()
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock }
    })

    render(<OfflineFallback />)
    
    fireEvent.click(screen.getByRole('button', { name: /retry connection/i }))
    expect(reloadMock).toHaveBeenCalledTimes(1)
  })
})