import { useWeatherStore } from '../store/weatherStore';

const Favorites = () => {
  const { favoriteLocations, fetchWeather } = useWeatherStore();

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-2">Favorites</h2>
      <ul className="space-y-2">
        {favoriteLocations.map((location: string) => (
          <li key={location} className="flex justify-between">
            <span>{location}</span>
            <button
              onClick={() => fetchWeather(location)}
              className="text-blue-500 hover:underline"
            >
              View
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Favorites;