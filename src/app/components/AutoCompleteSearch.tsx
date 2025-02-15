import React, { useState, useEffect } from 'react';
import { useWeatherStore } from '../store/weatherStore';

const AutoCompleteSearch = () => {
  const [query, setQuery] = useState('');
  const { fetchWeather } = useWeatherStore();
  const [locationDenied, setLocationDenied] = useState(false);

  // Function to get the current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Call a function to get city name from coordinates and then fetch weather
          getCityName(latitude, longitude)
            .then((city) => {
              if (city) {
                fetchWeather(city);
                setLocationDenied(false); // Reset locationDenied state
              }
            })
            .catch((error) => {
              console.error('Error getting city name:', error);
              // If getCityName fails, fallback to IP-based location
              getCityByIP();
            });
        },
        (error) => {
          setLocationDenied(true);
          // Fallback to IP-based location
          getCityByIP();
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocationDenied(true);
      // Fallback to IP-based location
      getCityByIP();
    }
  };

  // Function to get city by IP address
  const getCityByIP = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/'); // Using ipapi.co
      if (!response.ok) {
        throw new Error('Failed to get location by IP');
      }
      const data = await response.json();
      const city = data.city;
      if (city) {
        fetchWeather(city);
      } else {
        console.error('Could not determine city from IP data');
        fetchWeather('New York'); // Final fallback
      }
    } catch (error) {
      console.error('Error getting location by IP:', error);
      fetchWeather('New York'); // Final fallback
    }
  };

  useEffect(() => {
    // Call getCurrentLocation when the component mounts
    getCurrentLocation();
  }, [fetchWeather]);

  // Function to get city name from coordinates
  const getCityName = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Failed to get city name from coordinates');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0].name; // Assuming the API returns an array with city information
      }
      return null;
    } catch (error) {
      console.error('Error fetching city name:', error);
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWeather(query);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    }
  };

  return (
    <div>
      <form className="px-4 w-full max-w-[1200px]" onSubmit={handleSearch}>
        <label
          className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          htmlFor="default-search"
        >
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
            >
              <path
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
            ></path>
          </svg>
        </div>
        <input
          required
          placeholder="Search city or zipcode"
          className="block w-full min-w-[600px] p-4 py-5 ps-10 text-lg text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          id="default-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="absolute end-2.5 bottom-1/2 translate-y-1/2 p-4 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="w-4 h-4"
          >
            <path
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              stroke="currentColor"
            ></path>
          </svg>
          <span className="sr-only">Search</span>
        </button>
      </div>
    </form>
  </div>
  );
};

export default AutoCompleteSearch;