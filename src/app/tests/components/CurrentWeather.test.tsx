import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrentWeather from '@/app/components/CurrentWeather';
import { useWeatherStore } from '@/app/store/weatherStore';

jest.mock('@/app/store/weatherStore');

const mockWeatherData = {
  name: 'London',
  main: {
    temp: 20,
    feels_like: 18,
    humidity: 70
  },
  weather: [{
    description: 'clear sky',
    icon: '01d',
    id: 800,
    main: 'Clear'
  }],
  wind: {
    speed: 5
  }
};

describe('CurrentWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders weather information correctly', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: mockWeatherData,
      unit: 'metric'
    })

    render(<CurrentWeather />)
    
    expect(screen.getByTestId('city-name')).toHaveTextContent('London');
    expect(screen.getByTestId('temperature')).toHaveTextContent('20°C');
    expect(screen.getByTestId('weather-description')).toHaveTextContent(/clear sky/i);
    expect(screen.getByTestId('humidity')).toHaveTextContent('70%');
  })

  it('shows loading state when data is not available', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: null,
      unit: 'metric'
    })

    render(<CurrentWeather />)
    
    expect(screen.getByTestId('weather-loading')).toBeInTheDocument()
  })

  it('converts temperature to fahrenheit when unit is imperial', () => {
    (useWeatherStore as unknown as jest.Mock).mockReturnValue({ 
      currentWeather: mockWeatherData,
      unit: 'imperial'
    });

    render(<CurrentWeather />);
    
    expect(screen.getByTestId('temperature')).toHaveTextContent('68°F');
  });
})