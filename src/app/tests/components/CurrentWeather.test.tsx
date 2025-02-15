import React from 'react';
import { render } from '@testing-library/react';
import CurrentWeather from '../../components/CurrentWeather';

describe('CurrentWeather', () => {
  it('renders weather data', () => {
    render(<CurrentWeather />);
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
    expect(screen.getByText('Feels like: 18°C')).toBeInTheDocument();
    expect(screen.getByText('Humidity: 60%')).toBeInTheDocument();
    expect(screen.getByText('Wind: 5 m/s')).toBeInTheDocument();
  });
});