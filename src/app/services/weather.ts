// import axios from 'axios';

// const API_URL = '/api/weather';
// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export const fetchWeather = async (location: string) => {
  if (!location) {
    return null; // Return null or an appropriate value to indicate invalid input
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/weather?q=${location}&appid=${process.env.NEXT_PUBLIC_API_KEY}&units=metric`
    );

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = response.status === 404
        ? `City "${location}" not found. Please check the spelling and try again.`
        : response.status === 401
        ? 'Invalid API key. Please contact support.'
        : response.status === 429
        ? 'Too many requests. Please try again later.'
        : errorData.message || 'Failed to fetch weather data';
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};
  
  export const fetchDefaultWeather = async (lat: number, lon: number) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${process.env.NEXT_PUBLIC_API_KEY}&units=metric`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch default weather data');
    }
    return response.json();
  };

  export const fetchForecast = async (location: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/forecast?q=${location}&appid=${process.env.NEXT_PUBLIC_API_KEY}&units=metric`
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  };

  export const getCitySuggestions = async (query: string) => {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${process.env.NEXT_PUBLIC_API_KEY}`
    );
  
    if (!response.ok) {
      throw new Error('Failed to fetch city suggestions');
    }
  
    return response.json();
  };