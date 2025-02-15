import React from 'react';
import { useWeatherStore } from '../store/weatherStore';

const Map = () => {
  const { currentWeather } = useWeatherStore();

  if (!currentWeather) {
    return null;
  }

  const { coord } = currentWeather;

  return (
    <div className="h-64 w-full mb-80">
      <iframe
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