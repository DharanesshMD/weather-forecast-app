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
  const [isLocationDenied, setLocationDenied] = useState(false);
  const rateLimiter = React.useMemo(() => new RateLimiter(30, 60000), []); // 30 requests per minute
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [ipGeolocationLimiter] = useState(() => new RateLimiter(1, 60000));
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showLocationMessage, setShowLocationMessage] = useState(false);
  const [isIPRateLimited, setIsIPRateLimited] = useState(false);
  const [cachedCity, setCachedCity] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastKnownCity');
    }
    return null;
  });
  

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
        () => {
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
      const canMakeRequest = await ipGeolocationLimiter.checkLimit();
      if (!canMakeRequest) {
        setIsIPRateLimited(true);
        setTimeout(() => setIsIPRateLimited(false), 5000);
        
        if (typeof window !== 'undefined' && cachedCity) {
          console.warn('IP geolocation rate limited, using cached location:', cachedCity);
          fetchWeather(cachedCity);
        } else {
          console.warn('IP geolocation rate limited and no cached location, using default');
          fetchWeather(cachedCity);
        }
        return;
      }
  
      // Try ipapi.co first
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
        // If ipapi fails, try alternative service
        const fallbackResponse = await fetch('https://api.ipify.org?format=json');
        if (!fallbackResponse.ok) {
          throw new Error('Failed to get location by IP');
        }
        const ipData = await fallbackResponse.json();
        const geoResponse = await fetch(`http://ip-api.com/json/${ipData.ip}`);
        if (!geoResponse.ok) {
          throw new Error('Failed to get location from IP');
        }
        const geoData = await geoResponse.json();
        if (geoData.city) {
          fetchWeather(geoData.city);
          return;
        }
      }
  
      const data = await response.json();
    if (data?.city) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastKnownCity', data.city);
      }
      setCachedCity(data.city);
      fetchWeather(data.city);
    } else {
      throw new Error('Could not determine city from IP data');
    }
  } catch (error) {
    console.error('Error getting location by IP:', error);
    if (cachedCity) {
      console.warn('Using cached location after error:', cachedCity);
      fetchWeather(cachedCity);
    } else {
      fetchWeather('New York');
    }
  }
};

  useEffect(() => {
    if (searchError) {
      const timer = setTimeout(() => {
        setSearchError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
    // Call getCurrentLocation when the component mounts
    getCurrentLocation();

    if (isLocationDenied) {
      setShowLocationMessage(true);
      const timer = setTimeout(() => {
        setShowLocationMessage(false);
      }, 5000); // 5 seconds
  
      return () => clearTimeout(timer);
    }
    
  }, [fetchWeather, searchError, isLocationDenied]);

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
    setSearchError(null); // Reset any previous errors
    setShowSuggestions(false); // Hide suggestions on submit
    
    try {
      await fetchWeather(query);
    } catch (error) {
      console.error('Error:', error);
      if (error instanceof Error) {
        setSearchError(error.message);
      } else {
        setSearchError('An unexpected error occurred');
      }
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
      {/* <label 
        id="theme-toggle" 
        className="top-4 right-4 z-10 cursor-pointer w-16 sm:hidden"
        // className="fixed left-[45%] -translate-x-1/2 top-4 sm:translate-x-0 sm:left-auto sm:right-4 sm:absolute z-10 cursor-pointer w-16"
      >
        <input
          type="checkbox"
          id="toggle"
          className="hidden"
          checked={isDarkMode}
          onChange={() => setIsDarkMode(!isDarkMode)}
        />
        <svg viewBox="0 0 69.667 44" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(3.5 3.5)" data-name="Component 15 – 1" id="Component_15_1">
            <g filter="url(#container)" transform="matrix(1, 0, 0, 1, -3.5, -3.5)">
              <rect fill="#83cbd8" transform="translate(3.5 3.5)" rx="17.5" height="35" width="60.667" data-name="container" id="container"></rect>
            </g>
            <g transform="translate(2.333 2.333)" id="button">
              <g data-name="sun" id="sun">
                <g filter="url(#sun-outer)" transform="matrix(1, 0, 0, 1, -5.83, -5.83)">
                  <circle fill="#f8e664" transform="translate(5.83 5.83)" r="15.167" cy="15.167" cx="15.167" data-name="sun-outer" id="sun-outer-2"></circle>
                </g>
                <g filter="url(#sun)" transform="matrix(1, 0, 0, 1, -5.83, -5.83)">
                  <path fill="rgba(246,254,247,0.29)" transform="translate(9.33 9.33)" d="M11.667,0A11.667,11.667,0,1,1,0,11.667,11.667,11.667,0,0,1,11.667,0Z" data-name="sun" id="sun-3"></path>
                </g>
                <circle fill="#fcf4b9" transform="translate(8.167 8.167)" r="7" cy="7" cx="7" id="sun-inner"></circle>
              </g>
              <g data-name="moon" id="moon">
                <g filter="url(#moon)" transform="matrix(1, 0, 0, 1, -31.5, -5.83)">
                  <circle fill="#cce6ee" transform="translate(31.5 5.83)" r="15.167" cy="15.167" cx="15.167" data-name="moon" id="moon-3"></circle>
                </g>
                <g fill="#a6cad0" transform="translate(-24.415 -1.009)" id="patches">
                  <circle transform="translate(43.009 4.496)" r="2" cy="2" cx="2"></circle>
                  <circle transform="translate(39.366 17.952)" r="2" cy="2" cx="2" data-name="patch"></circle>
                  <circle transform="translate(33.016 8.044)" r="1" cy="1" cx="1" data-name="patch"></circle>
                  <circle transform="translate(51.081 18.888)" r="1" cy="1" cx="1" data-name="patch"></circle>
                  <circle transform="translate(33.016 22.503)" r="1" cy="1" cx="1" data-name="patch"></circle>
                  <circle transform="translate(50.081 10.53)" r="1.5" cy="1.5" cx="1.5" data-name="patch"></circle>
                </g>
              </g>
            </g>
            <g filter="url(#cloud)" transform="matrix(1, 0, 0, 1, -3.5, -3.5)">
              <path fill="#fff" transform="translate(-3466.47 -160.94)" d="M3512.81,173.815a4.463,4.463,0,0,1,2.243.62.95.95,0,0,1,.72-1.281,4.852,4.852,0,0,1,2.623.519c.034.02-.5-1.968.281-2.716a2.117,2.117,0,0,1,2.829-.274,1.821,1.821,0,0,1,.854,1.858c.063.037,2.594-.049,3.285,1.273s-.865,2.544-.807,2.626a12.192,12.192,0,0,1,2.278.892c.553.448,1.106,1.992-1.62,2.927a7.742,7.742,0,0,1-3.762-.3c-1.28-.49-1.181-2.65-1.137-2.624s-1.417,2.2-2.623,2.2a4.172,4.172,0,0,1-2.394-1.206,3.825,3.825,0,0,1-2.771.774c-3.429-.46-2.333-3.267-2.2-3.55A3.721,3.721,0,0,1,3512.81,173.815Z" data-name="cloud" id="cloud"></path>
            </g>
            <g fill="#def8ff" transform="translate(3.585 1.325)" id="stars">
              <path transform="matrix(-1, 0.017, -0.017, -1, 24.231, 3.055)" d="M.774,0,.566.559,0,.539.458.933.25,1.492l.485-.361.458.394L1.024.953,1.509.592.943.572Z"></path>
              <path transform="matrix(-0.777, 0.629, -0.629, -0.777, 23.185, 12.358)" d="M1.341.529.836.472.736,0,.505.46,0,.4.4.729l-.231.46L.605.932l.4.326L.9.786Z" data-name="star"></path>
              <path transform="matrix(0.438, 0.899, -0.899, 0.438, 23.177, 29.735)" d="M.015,1.065.475.9l.285.365L.766.772l.46-.164L.745.494.751,0,.481.407,0,.293.285.658Z" data-name="star"></path>
              <path transform="translate(12.677 0.388) rotate(104)" d="M1.161,1.6,1.059,1,1.574.722.962.607.86,0,.613.572,0,.457.446.881.2,1.454l.516-.274Z" data-name="star"></path>
              <path transform="matrix(-0.07, 0.998, -0.998, -0.07, 11.066, 15.457)" d="M.873,1.648l.114-.62L1.579.945,1.03.62,1.144,0,.706.464.157.139.438.7,0,1.167l.592-.083Z" data-name="star"></path>
              <path transform="translate(8.326 28.061) rotate(11)" d="M.593,0,.638.724,0,.982l.7.211.045.724.36-.64.7.211L1.342.935,1.7.294,1.063.552Z" data-name="star"></path>
              <path transform="translate(5.012 5.962) rotate(172)" d="M.816,0,.5.455,0,.311.323.767l-.312.455.516-.215.323.456L.827.911,1.343.7.839.552Z" data-name="star"></path>
              <path transform="translate(2.218 14.616) rotate(169)" d="M1.261,0,.774.571.114.3.487.967,0,1.538.728,1.32l.372.662.047-.749.728-.218L1.215.749Z" data-name="star"></path>
            </g>
          </g>
        </svg>
      </label> */}
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
          className="block w-full min-w-[300px] sm:min-w-[600px] p-4 py-5 ps-10 text-lg text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 outline-none focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
    {showLocationMessage && isLocationDenied && (
  <div className="px-4 mt-2 text-gray-400 text-sm transition-opacity duration-300">
    Location access was denied. Using IP-based location instead.
  </div>
)}

{/* {isIPRateLimited && cachedCity && (
  <div className="px-4 mt-2 text-amber-500 text-sm transition-opacity duration-300">
    IP geolocation rate limited. Using last known location: {cachedCity}
  </div>
)} */}

{isRateLimited && (
    <div className="px-4 mt-2 text-gray-400 text-sm transition-opacity duration-300">
      Too many requests. Please wait a moment before trying again.
    </div>
  )}

    {searchError && (
  <div className="px-4 mt-2 text-red-500 text-sm">
    {searchError}
  </div>
)}

    {/* Suggestions dropdown */}
    {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-[300px] sm:w-[600px] ml-4 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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