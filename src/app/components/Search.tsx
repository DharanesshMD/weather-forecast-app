import { useState } from 'react';
import { useWeatherStore } from '../store/weatherStore';

const Search = () => {
  const [query, setQuery] = useState('');
  const { fetchWeather, error } = useWeatherStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchWeather(query);
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Enter city name or ZIP code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-l focus:outline-none"
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600">
          Search
        </button>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default Search;