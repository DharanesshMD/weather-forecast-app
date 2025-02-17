import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Forecast from '@/app/components/Forecast';
import { useWeatherStore } from '@/app/store/weatherStore';

jest.mock('@/app/store/weatherStore');
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />
}));


// Mock forecast data
const mockForecastData = {
  list: [
    {
      dt: new Date('2024-02-18').getTime() / 1000,
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
    },
    {
      dt: new Date('2024-02-19').getTime() / 1000,
      weather: [{
        icon: '02d',
        description: 'few clouds'
      }],
      main: {
        temp: 22,
        humidity: 72
      },
      wind: {
        speed: 4
      }
    }
  ]
}

describe('Forecast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders forecast data correctly', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      forecast: mockForecastData,
      unit: 'metric'
    });

    render(<Forecast />);

    const forecastDay = screen.getByTestId('forecast-day-0');
    fireEvent.click(forecastDay.querySelector('button')!);
    
    expect(screen.getByTestId('forecast-title')).toHaveTextContent('5-Day Forecast');
    expect(screen.getByTestId('forecast-day-name-0')).toHaveTextContent('Tomorrow');
    expect(screen.getByTestId('forecast-temp-0')).toHaveTextContent('20°C');
    expect(screen.getByTestId('forecast-humidity-0')).toHaveTextContent('70%');
    expect(screen.getByTestId('forecast-wind-0')).toHaveTextContent('5.0 m/s');
  });

  it('shows loading state when data is not available', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      forecast: null,
      unit: 'metric'
    });

    render(<Forecast />);
    expect(screen.getByTestId('forecast-loading')).toBeInTheDocument();
  });

  it('handles empty forecast list', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      forecast: { list: [] },
      unit: 'metric'
    });

    render(<Forecast />);
    expect(screen.getByTestId('forecast-empty')).toBeInTheDocument();
  });

  it('expands forecast details on click', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      forecast: mockForecastData,
      unit: 'metric'
    });

    render(<Forecast />);
    
    const forecastDay = screen.getByTestId('forecast-day-0');
    fireEvent.click(forecastDay.querySelector('button')!);
    
    expect(screen.getByTestId('forecast-temp-expanded-0')).toBeInTheDocument();
    expect(screen.getByTestId('forecast-humidity-0')).toBeInTheDocument();
    expect(screen.getByTestId('forecast-wind-0')).toBeInTheDocument();
  });

  it('converts temperatures to fahrenheit when unit is imperial', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      forecast: mockForecastData,
      unit: 'imperial'
    });

    render(<Forecast />);
    
    fireEvent.click(screen.getByTestId('forecast-day-0'));
    // 20°C = 68°F
    expect(screen.getByTestId('forecast-temp-0')).toHaveTextContent('68°F');
  });
});