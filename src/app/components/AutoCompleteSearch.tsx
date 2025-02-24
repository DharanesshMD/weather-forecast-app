import React, { useState, useEffect, useCallback } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import { debounce } from 'lodash';
import { RateLimiter } from '../../../utils/ratelimiter';
import { X } from 'lucide-react';

interface Suggestion {
  name: string;
  country: string;
  state?: string;
}

interface RecentLocation {
  name: string;
  timestamp: number;
}

const MAX_RECENT_SEARCHES = 5;

const AutoCompleteSearch = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentLocation[]>([]);
  const { fetchWeather } = useWeatherStore();
  const [isLocationDenied, setLocationDenied] = useState(false);
  const rateLimiter = React.useMemo(() => new RateLimiter(30, 60000), []); // 30 requests per minute
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [ipGeolocationLimiter] = useState(() => new RateLimiter(1, 60000));
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showLocationMessage, setShowLocationMessage] = useState(false);
  const [hasFetchedLocation, setHasFetchedLocation] = useState(false);
  const [hasShownLocationMessage, setHasShownLocationMessage] = useState(false);
  const [isIPRateLimited, setIsIPRateLimited] = useState(false);
  const [isFallbackToDefaultCity, setIsFallbackToDefaultCity] = useState(false);
  const [hasShownFallbackMessage, setHasShownFallbackMessage] = useState(false);
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
          getCityName(latitude, longitude)
            .then((city) => {
              if (city) {
                fetchWeather(city);
                setLocationDenied(false); // Reset locationDenied state
              }
            })
            .catch(() => {
              // If getCityName fails, fallback to IP-based location
              getCityByIP();
            });
        },
        () => {
          setLocationDenied(true); // Set locationDenied to true only on geolocation denial
          getCityByIP(); // Fallback to IP-based location
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 }
      );
    } else {
      setLocationDenied(true); // Set locationDenied to true if geolocation is not supported
      getCityByIP(); // Fallback to IP-based location
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
          fetchWeather(cachedCity);
        } else {
          fetchWeather(cachedCity);
        }
        return;
      }
  
      const response = await fetch('https://ipapi.co/json/');
      if (!response.ok) {
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
      if (cachedCity) {
        fetchWeather(cachedCity);
      } else {
        // Fallback to "New York"
        fetchWeather('New York');
        if (!hasShownFallbackMessage) {
          setIsFallbackToDefaultCity(true); // Show the message
          setHasShownFallbackMessage(true); // Mark the message as shown
        }
      }
    }
  };
  useEffect(() => {
    // Handle searchError separately and return early
    if (searchError) {
      const timer = setTimeout(() => {
        setSearchError(null);
      }, 10000); // 10 seconds
  
      return () => clearTimeout(timer);
    }
  
    // If the location has not been fetched yet, call getCurrentLocation
    if (!hasFetchedLocation) {
      getCurrentLocation();
      setHasFetchedLocation(true); // Mark the location as fetched
    }
  
    // If there is no searchError and location has been denied, show the message
    if (isLocationDenied && !hasShownLocationMessage) {
      setShowLocationMessage(true);
      setHasShownLocationMessage(true); // Mark the message as shown
      const timer = setTimeout(() => {
        setShowLocationMessage(false);
      }, 5000); // 5 seconds
  
      return () => clearTimeout(timer);
    }

    if (isFallbackToDefaultCity) {
      const timer = setTimeout(() => {
        setIsFallbackToDefaultCity(false); // Hide the message after 5 seconds
      }, 5000); // 5 seconds
  
      return () => clearTimeout(timer);
    }

  
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecentSearches(parsed);
        } catch (e) {
          // Error parsing recent searches
        }
      }
    }
  }, [fetchWeather, searchError, isLocationDenied, isFallbackToDefaultCity]);

  const addToRecentSearches = (locationName: string) => {
    setRecentSearches(prevSearches => {
      const newSearches = prevSearches.filter(search => search.name !== locationName);
      const updatedSearches = [
        { name: locationName, timestamp: Date.now() },
        ...newSearches
      ].slice(0, MAX_RECENT_SEARCHES);

      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
      return updatedSearches;
    });
  };

  const handleRecentSearchClick = (locationName: string) => {
    setQuery(locationName);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather(locationName);
    addToRecentSearches(locationName);
  };

  // Function to get city name from coordinates
  const getCityName = async (latitude: number, longitude: number): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_API_KEY}`
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
      return null;
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null); // Reset any previous errors
    setShowSuggestions(false); // Hide suggestions on submit
  
    try {
      await fetchWeather(query);
      addToRecentSearches(query);
    } catch (error) {
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
        `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      setSuggestions(data.map((item: any) => ({
        name: item.name,
        country: item.country,
        state: item.state
      })));
    } catch (error) {
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
    addToRecentSearches(suggestion.name);
  };

  const deleteRecentSearch = (e: React.MouseEvent, locationName: string) => {
    e.stopPropagation(); // Stop event from bubbling up to parent
    setRecentSearches(prevSearches => {
      const updatedSearches = prevSearches.filter(search => search.name !== locationName);
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      }
      return updatedSearches;
    });
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
          autoComplete="off"
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
    {recentSearches.length > 0 && (
        <div className="px-4 mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent Searches
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((location, index) => (
              <div
                key={`${location.name}-${index}`}
                className="relative flex items-center"
              >
                <button
                  onClick={() => handleRecentSearchClick(location.name)}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors pr-8"
                >
                  {location.name}
                </button>
                <button
                  onClick={(e) => deleteRecentSearch(e, location.name)}
                  className="absolute right-1 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
                  aria-label={`Remove ${location.name} from recent searches`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    {showLocationMessage && isLocationDenied && (
  <div className="px-4 mt-2 text-gray-400 text-sm transition-opacity duration-300">
    Location access was denied. Using IP-based location instead.
  </div>
)}

{isFallbackToDefaultCity && (
  <div className="px-4 mt-2 text-gray-400 text-sm transition-opacity duration-300">
    Too many rapid requests. Defaulting to New York.
  </div>
)}

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