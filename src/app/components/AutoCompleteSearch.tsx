import React, { useState, useEffect, useCallback } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { debounce } from 'lodash';
import { RateLimiter } from '../../../utils/ratelimiter';

interface Suggestion {
  name: string;
  country: string;
  state?: string;
}

const AutoCompleteSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { fetchWeather } = useWeatherStore();
  const [locationDenied, setLocationDenied] = useState(false);
  const rateLimiter = React.useMemo(() => new RateLimiter(30, 60000), []); // 30 requests per minute
  const [isRateLimited, setIsRateLimited] = useState(false);

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

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const canMakeRequest = await rateLimiter.checkLimit();
    if (!canMakeRequest) {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 5000); // Reset after 5 seconds
      return;
    }
    
      const response = await fetch(
        `http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSuggestions(data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state
      })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  {isRateLimited && (
    <div className="absolute -bottom-8 left-0 w-full text-center text-sm text-red-500">
      Too many requests. Please wait a moment before trying again.
    </div>
  )}

  const debouncedFetchSuggestions = useCallback(
    debounce((input: string) => fetchSuggestions(input), 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather(suggestion.name);
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
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
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
    {/* Suggestions dropdown */}
    {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-[600px] ml-4 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${index}`}
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {suggestion.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {suggestion.state ? `${suggestion.state}, ` : ''}{suggestion.country}
              </span>
            </div>
          ))}
        </div>
      )}
  </div>
  );
};

export default AutoCompleteSearch;