export const formatTemperature = (temperature: number, unit: 'metric' | 'imperial') => {
    if (unit === 'imperial') {
      temperature = (temperature * 9 / 5) + 32;
    }
    return `${temperature.toFixed(1)}${unit === 'metric' ? '°C' : '°F'}`;
  };
  
  export const formatWindSpeed = (windSpeed: number, unit: 'metric' | 'imperial') => {
    if (unit === 'imperial') {
      windSpeed = windSpeed * 2.23694; // Convert m/s to mph
    }
    return `${windSpeed.toFixed(1)}${unit === 'metric' ? ' m/s' : ' mph'}`;
  };