import React from 'react';
import { useWeatherStore } from '../store/weatherStore';
import Image from 'next/image';

const CurrentWeather = () => {
  const { currentWeather, forecast, unit, setUnit } = useWeatherStore();

  if (!currentWeather) {
    return null;
  }

  const getWeatherIconUrl = (iconCode: string) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const convertTemperature = (celsius: number): number => {
    return unit === 'metric' ? celsius : (celsius * 9/5) + 32;
  };

  const handleUnitToggle = () => {
    setUnit(unit === 'metric' ? 'imperial' : 'metric');
  };


  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start mb-4">
        <div className="text-center flex-grow sm:ml-[108px]">
          <div className="flex items-center justify-center">
            <Image
              src={getWeatherIconUrl(currentWeather.weather[0].icon)}
              alt={currentWeather.weather[0].description}
              width={70}
              height={70}
            />
            <h2 className="text-2xl font-bold ml-2 text-gray-600 dark:text-gray-200">
              {currentWeather.name}
            </h2>
          </div>
          <p className="mt-0 mb-5 sm:mt-2 text-xl text-gray-600 dark:text-gray-200">
            {currentWeather.weather[0].description}
          </p>
        </div>
        <label htmlFor="tempToggle" className="inline-flex items-center space-x-4 cursor-pointer dark:text-gray-200">
          <span className="text-gray-600 dark:text-gray-200">°C</span>
          <span className="relative">
            <input
              id="tempToggle"
              type="checkbox"
              className="hidden peer"
              checked={unit === 'imperial'}
              onChange={handleUnitToggle}
            />
            <div className="w-10 h-4 rounded-full shadow dark:bg-gray-400 peer-checked:dark:bg-gray-400"></div>
            <div className="absolute left-0 w-6 h-6 rounded-full shadow -inset-y-1 peer-checked:right-0 peer-checked:left-auto dark:bg-gray-600 bg-gray-300 transition-all duration-300"></div>
          </span>
          <span className="text-gray-600 dark:text-gray-200">°F</span>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center max-w-2xl mx-auto">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-200">
            {convertTemperature(currentWeather.main.temp).toFixed(1)}°{unit === 'metric' ? 'C' : 'F'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-xl font-semibold text-gray-600 dark:text-gray-200">
            {currentWeather.main.humidity}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg relative mb-8 sm:transform sm:translate-x-[175px]">
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