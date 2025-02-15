import React from 'react';
import { render } from '@testing-library/react';
importForecastFrom '../../components/Forecast';

describe('Forecast', () => {
  it('renders forecast data', () => {
    render(<Forecast />);
    expect(screen.getByText('5-Day Forecast')).toBeInTheDocument();
    expect(screen.getByText('2023-10-01')).toBeInTheDocument();
    expect(screen.getByText('20°C')).toBeInTheDocument();
  });
});