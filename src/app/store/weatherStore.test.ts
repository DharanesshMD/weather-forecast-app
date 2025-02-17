import { renderHook, act } from '@testing-library/react'
import { useWeatherStore } from './weatherStore'
import { fetchWeather as fetchWeatherService, fetchForecast } from '../services/weather'

// Mock weather service
jest.mock('../services/weather', () => ({
  fetchWeather: jest.fn(),
  fetchForecast: jest.fn()
}))

// Mock weather data
const mockWeatherData = {
  name: 'London',
  coord: {
    lat: 51.5074,
    lon: -0.1278
  },
  main: {
    temp: 20,
    feels_like: 18,
    humidity: 70
  },
  wind: {
    speed: 5
  },
  weather: [{
    description: 'clear sky',
    icon: '01d',
    id: 800,
    main: 'Clear'
  }]
}

const mockForecastData = {
  list: [{
    dt: 1645484400,
    weather: [{
      icon: '01d',
      description: 'clear sky'
    }],
    main: {
      temp: 20,
      humidity: 70
    },
    wind: {
      speed: 5
    }
  }]
}

describe('Weather Store', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useWeatherStore())
      
      expect(result.current.currentWeather).toBeNull()
      expect(result.current.forecast).toEqual({ list: [] })
      expect(result.current.loading).toBeFalsy()
      expect(result.current.error).toBeNull()
      expect(result.current.unit).toBe('metric')
      expect(result.current.favoriteLocations).toEqual([])
    })
  })

  describe('Weather Data Management', () => {
    it('should fetch weather data successfully', async () => {
      const { result } = renderHook(() => useWeatherStore())
      
      // Mock successful API responses
      ;(fetchWeatherService as jest.Mock).mockResolvedValue(mockWeatherData)
      ;(fetchForecast as jest.Mock).mockResolvedValue(mockForecastData)

      await act(async () => {
        await result.current.fetchWeather('London')
      })

      expect(result.current.currentWeather).toEqual(mockWeatherData)
      expect(result.current.forecast).toEqual(mockForecastData)
      expect(result.current.loading).toBeFalsy()
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors correctly', async () => {
        const { result } = renderHook(() => useWeatherStore())
        const errorMessage = 'City not found'
        
        // Mock API error
        ;(fetchWeatherService as jest.Mock).mockRejectedValue(new Error(errorMessage))
    
        try {
          await act(async () => {
            await result.current.fetchWeather('InvalidCity')
          })
        } catch (_) { // Changed error to _ to indicate unused parameter
          expect(result.current.error).toBe(errorMessage)
          expect(result.current.loading).toBeFalsy()
        }
      })

      it('should maintain existing data on fetch error', async () => {
        const { result } = renderHook(() => useWeatherStore())
        
        // First set some initial data
        ;(fetchWeatherService as jest.Mock).mockResolvedValueOnce(mockWeatherData)
        ;(fetchForecast as jest.Mock).mockResolvedValueOnce(mockForecastData)
    
        await act(async () => {
          await result.current.fetchWeather('London')
        })
    
        // Then simulate an error
        ;(fetchWeatherService as jest.Mock).mockRejectedValueOnce(new Error('Failed'))
    
        try {
          await act(async () => {
            await result.current.fetchWeather('InvalidCity')
          })
        } catch (_) { // Changed error to _ to indicate unused parameter
          expect(result.current.currentWeather).toEqual(mockWeatherData)
          expect(result.current.forecast).toEqual(mockForecastData)
        }
      })
    })

  describe('Temperature Unit Management', () => {
    it('should change temperature unit', () => {
      const { result } = renderHook(() => useWeatherStore())
      
      act(() => {
        result.current.setUnit('imperial')
      })
      expect(result.current.unit).toBe('imperial')

      act(() => {
        result.current.setUnit('metric')
      })
      expect(result.current.unit).toBe('metric')
    })
  })

  describe('Favorite Locations Management', () => {
    it('should add location to favorites', () => {
      const { result } = renderHook(() => useWeatherStore())
      const location = 'London'

      act(() => {
        result.current.addFavorite(location)
      })

      expect(result.current.favoriteLocations).toContain(location)
    })

    it('should remove location from favorites', () => {
      const { result } = renderHook(() => useWeatherStore())
      const location = 'London'

      act(() => {
        result.current.addFavorite(location)
        result.current.removeFavorite(location)
      })

      expect(result.current.favoriteLocations).not.toContain(location)
    })

    it('should handle multiple favorite locations', () => {
      const { result } = renderHook(() => useWeatherStore())
      const locations = ['London', 'Paris', 'Tokyo']

      act(() => {
        locations.forEach(location => result.current.addFavorite(location))
      })

      expect(result.current.favoriteLocations).toHaveLength(locations.length)
      locations.forEach(location => {
        expect(result.current.favoriteLocations).toContain(location)
      })
    })
  })

  describe('Loading State', () => {
    it('should handle loading state during fetch', async () => {
      const { result } = renderHook(() => useWeatherStore())
      
      let isLoadingDuringFetch = false
      
      ;(fetchWeatherService as jest.Mock).mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => {
            isLoadingDuringFetch = result.current.loading
            resolve(mockWeatherData)
          }, 100)
        })
      )
      ;(fetchForecast as jest.Mock).mockResolvedValue(mockForecastData)

      act(() => {
        result.current.fetchWeather('London')
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })

      expect(isLoadingDuringFetch).toBeTruthy()
      expect(result.current.loading).toBeFalsy()
    })
  })
})