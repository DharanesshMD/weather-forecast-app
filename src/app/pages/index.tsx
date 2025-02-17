import { useEffect, useState, lazy, Suspense } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { useTranslation } from 'next-i18next';
import { fetchDefaultWeather, fetchWeather } from '../services/weather';

const AutoCompleteSearch = lazy(() => import('../components/AutoCompleteSearch'));
const CurrentWeather = lazy(() => import('../components/CurrentWeather'));
const Forecast = lazy(() => import('../components/Forecast'));
const Favorites = lazy(() => import('../components/Favorites'));
const Map = lazy(() => import('../components/Map'));

const Home = () => {
  const { unit, setUnit } = useWeatherStore();
  const [isOnline, setIsOnline] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { t } = useTranslation('common');

  useEffect(() => {
    const fetchDefaultWeatherData = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await fetchDefaultWeather(latitude, longitude);
            await fetchWeather(data.name);
          } catch (error) {
            console.error('Failed to fetch default weather data:', error);
          }
        }, () => {
          // Fallback to New York if geolocation is not available
          fetchWeather('New York');
        });
      } else {
        fetchWeather('New York');
      }
    };

    fetchDefaultWeatherData();

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, [fetchWeather]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Suspense fallback={<div>Loading...</div>}>
            <AutoCompleteSearch />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <CurrentWeather />
          </Suspense>
          <Suspense fallback={<div>Loading...</div>}>
            <Forecast />
          </Suspense>
        </div>
        <div className="mt-4">
          <button
            onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('switchUnit', { unit: unit === 'metric' ? 'Fahrenheit' : 'Celsius' })}
          </button>
        </div>
        <div className="mt-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Favorites />
          </Suspense>
        </div>
        <div className="mt-4">
          <Suspense fallback={<div>Loading...</div>}>
            <Map />
          </Suspense>
        </div>
        <div className="mt-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        {!isOnline && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-red-700">
            {t('offline')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;