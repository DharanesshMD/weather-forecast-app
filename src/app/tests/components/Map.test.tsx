import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Map from '@/app/components/Map';
import { useWeatherStore } from '@/app/store/weatherStore';

// Mock the weather store
jest.mock('@/app/store/weatherStore');

const mockWeatherData = {
  name: 'London',
  coord: {
    lat: 51.5074,
    lon: -0.1278
  }
};

describe('Map', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state when no weather data is available', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: null
    });

    render(<Map />);
    expect(screen.getByTestId('map-loading')).toBeInTheDocument();
  });

  it('renders map container when weather data is available', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: mockWeatherData
    });

    render(<Map />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    expect(screen.getByTestId('map-iframe')).toHaveAttribute(
      'src',
      `https://maps.google.com/maps?q=51.5074,-0.1278&z=15&output=embed`
    );
  });

  it('shows error state when coordinates are invalid', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: {
        name: 'Invalid City',
        coord: null
      }
    });

    render(<Map />);
    expect(screen.getByTestId('map-error')).toBeInTheDocument();
    expect(screen.getByTestId('map-error')).toHaveTextContent('Unable to load location map');
  });

  it('includes location name in iframe title for accessibility', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: mockWeatherData
    });

    render(<Map />);
    expect(screen.getByTitle(`Map showing weather location for London`)).toBeInTheDocument();
  });
});