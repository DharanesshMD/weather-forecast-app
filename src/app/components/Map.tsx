import React from 'react';
import { useWeatherStore } from '../store/weatherStore';

const Map = () => {
  const { currentWeather } = useWeatherStore();

  if (!currentWeather) {
    return (
      <div data-testid="map-loading" className="animate-pulse h-64 w-full">
        <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const { coord } = currentWeather;

  if (!coord || !coord.lat || !coord.lon) {
    return (
      <div data-testid="map-error" className="h-64 w-full flex items-center justify-center text-red-500">
        Unable to load location map
      </div>
    );
  }

  return (
    <div data-testid="map-container" className="h-64 w-full mb-80">
      <iframe
        data-testid="map-iframe"
        title={`Map showing weather location for ${currentWeather.name}`}
        width="100%"
        height="200%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://maps.google.com/maps?q=${coord.lat},${coord.lon}&z=15&output=embed`}
      ></iframe>
    </div>
  );
};

export default Map;