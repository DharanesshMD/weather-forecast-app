import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AutoCompleteSearch from '@/app/components/AutoCompleteSearch';
import { useWeatherStore } from '@/app/store/weatherStore';

// Mock the weather store
jest.mock('@/app/store/weatherStore');

// Mock fetch
global.fetch = jest.fn();

const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation(success => 
    success({
      coords: {
        latitude: 51.5074,
        longitude: -0.1278
      }
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

// Set up navigator mock
Object.defineProperty(global, 'navigator', {
  value: {
    geolocation: mockGeolocation
  },
  writable: true
});

const mockSuggestions = [
  {
    name: 'London',
    country: 'GB',
    state: ''
  },
  {
    name: 'New York',
    country: 'US',
    state: 'NY'
  }
];

describe('AutoCompleteSearch', () => {
  const mockFetchWeather = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({
      fetchWeather: mockFetchWeather,
      searchError: null
    });
  });

  it('renders search input', () => {
    render(<AutoCompleteSearch />);
    expect(screen.getByPlaceholderText(/search city or zipcode/i)).toBeInTheDocument();
  });

  it('shows suggestions when typing', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSuggestions)
        })
      );

    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText(/search city or zipcode/i);
    
    fireEvent.change(input, { target: { value: 'Lon' } });

    await waitFor(() => {
      expect(screen.getByTestId('suggestion-0')).toHaveTextContent('London');
      expect(screen.getByTestId('suggestion-0')).toHaveTextContent('GB');
    });
  });

  it('handles suggestion click', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSuggestions)
        })
      );

    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText(/search city or zipcode/i);
    
    fireEvent.change(input, { target: { value: 'Lon' } });

    await waitFor(async () => {
      const suggestion = screen.getByTestId('suggestion-0');
      fireEvent.click(suggestion);
      expect(mockFetchWeather).toHaveBeenCalledWith('London');
    });
  });

  it('handles search submission', async () => {
    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText(/search city or zipcode/i);
    const form = screen.getByTestId('search-form');
    
    fireEvent.change(input, { target: { value: 'London' } });
    fireEvent.submit(form);

    expect(mockFetchWeather).toHaveBeenCalledWith('London');
  });

  it('displays error message when search fails', async () => {
    const errorMessage = 'City not found';
    mockFetchWeather.mockRejectedValueOnce(new Error(errorMessage));
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({
      fetchWeather: mockFetchWeather,
      searchError: errorMessage
    });

    render(<AutoCompleteSearch />);
    const input = screen.getByPlaceholderText(/search city or zipcode/i);
    const form = screen.getByTestId('search-form');
    
    fireEvent.change(input, { target: { value: 'InvalidCity' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('search-error')).toHaveTextContent(errorMessage);
    });
  });

  it('handles geolocation successfully', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ city: 'London' })
        })
      );

    render(<AutoCompleteSearch />);
    
    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      expect(mockFetchWeather).toHaveBeenCalledWith('London');
    });
  });

  it('handles geolocation error', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => 
      error(new Error('Geolocation error'))
    );

    (useWeatherStore as unknown as jest.Mock).mockReturnValue({
      fetchWeather: mockFetchWeather,
      searchError: 'Unable to get your location'
    });

    render(<AutoCompleteSearch />);
    
    await waitFor(() => {
      expect(screen.getByTestId('search-error')).toHaveTextContent(/unable to get your location/i);
    });
  });
});