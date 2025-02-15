import React from 'react';
import { useWeatherStore } from '../store/weatherStore';
import Image from 'next/image';

const CurrentWeather = () => {
  const { currentWeather, forecast } = useWeatherStore();

  if (!currentWeather) {
    return null;
  }

  const getWeatherIconUrl = (iconCode: string) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const tomorrowWeather = forecast[0];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      {/* Current Weather Details */}
      <div className="text-center">
        <div className="flex items-center justify-center">
          <Image
            src={getWeatherIconUrl(currentWeather.weather[0].icon)}
            alt={currentWeather.weather[0].description}
            width={70}
            height={70}
          />
          <h2 className="text-2xl font-bold ml-2 text-gray-600 dark:text-gray-200">{currentWeather.name}</h2>
        </div>
        <p className="mt-2 text-xl text-gray-600 dark:text-gray-200">{currentWeather.weather[0].description}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-200">
            {currentWeather.main.temp.toFixed(1)}°C
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-200">
            {currentWeather.main.humidity}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 ">Humidity</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg relative mb-8" style={{ left: '175px' }}>
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-200">
            {currentWeather.wind.speed} m/s
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;