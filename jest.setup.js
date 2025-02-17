import '@testing-library/jest-dom'
import 'whatwg-fetch'
import fetchMock from 'jest-fetch-mock'

// Enable fetch mocks
fetchMock.enableMocks()

// Reset mocks before each test
beforeEach(() => {
  fetchMock.resetMocks()
})

// Mock window.matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  }
}

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockImplementation(function(callback, options) {
  return {
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  }
})
window.IntersectionObserver = mockIntersectionObserver

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock scrollTo
window.scrollTo = jest.fn()

// Set up JSDOM environment variables
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
})