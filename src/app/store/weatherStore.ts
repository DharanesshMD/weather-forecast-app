import { create } from 'zustand';
import { fetchWeather as fetchWeatherService, fetchForecast } from '../services/weather';

interface Coord {
  lat: number;
  lon: number;
}

interface Main {
  temp: number;
  feels_like: number;
  humidity: number;
}

interface Wind {
  speed: number;
}

interface WeatherDescription {
  description: string;
  icon: string;
  id: number;
  main: string;
}
interface CurrentWeather {
  name: string;
  coord: Coord;
  main: Main;
  wind: Wind;
  weather: WeatherDescription[];
  temp: number;
  humidity: number;
  windSpeed: number;
  description: string;
  
}

// interface ForecastDay {
//   dt: number;
//   main: {
//     temp: number;
//     temp_min: number;
//     temp_max: number;
//   };
//   weather: WeatherDescription[];
//   dt_txt: string;
//   temp: number;
//   humidity: number;
//   windSpeed: number;
//   description: string;
// }

interface Forecast {
  list: ForecastDay[];
}

export interface ForecastDay {
  dt: number;
  weather: [{
    icon: string;
    description: string;
  }];
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
}

interface WeatherStore {
  currentWeather: CurrentWeather | null;
  forecast: ForecastDay[];  // Changed from Forecast to ForecastDay[]
  fetchWeather: (location: string) => Promise<void>;
}

interface WeatherState {
  currentWeather: CurrentWeather | null;
  forecast: Forecast | null;
  loading: boolean;
  error: string | null;
  unit: 'metric' | 'imperial';
  favoriteLocations: string[];
  fetchWeather: (query: string) => Promise<void>;
  setUnit: (unit: 'metric' | 'imperial') => void;
  addFavorite: (location: string) => void;
  removeFavorite: (location: string) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  currentWeather: null,
  forecast: null,
  loading: false,
  error: null,
  unit: 'metric',
  favoriteLocations: [],
  fetchWeather: async (query: string) => {
    set({ loading: true, error: null });
    try {
      const currentWeather = await fetchWeatherService(query);
      const forecast = await fetchForecast(query);
      set({ currentWeather, forecast });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
  setUnit: (unit: 'metric' | 'imperial') => set({ unit }),
  addFavorite: (location: string) => set((state: WeatherState) => ({ favoriteLocations: [...state.favoriteLocations, location] })),
  removeFavorite: (location: string) => set((state: WeatherState) => ({ favoriteLocations: state.favoriteLocations.filter((loc: string) => loc !== location) })),
}));