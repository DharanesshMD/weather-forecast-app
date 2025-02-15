import React, { useState } from 'react';
import { useWeatherStore } from '../store/weatherStore';
import Image from 'next/image';

interface ForecastDay {
  dt: number;
  main: {
    temp: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  weather: [{
    description: string;
    icon: string;
  }];
}

interface DailyForecast {
  [key: string]: {
    date: Date;
    dayName: string;
    weather: {
      description: string;
      icon: string;
    };
    temps: number[];
    humidities: number[];
    windSpeeds: number[];
  };
}

const Forecast = () => {
  const { forecast } = useWeatherStore();
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!forecast || !forecast.list) return null;

  const getWeatherIconUrl = (iconCode: string) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getDayName = (date: Date, index: number): string => {
    if (index === 0) return 'Tomorrow';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  // Group forecasts by day
  const dailyForecasts = forecast.list.reduce<DailyForecast>((acc, item) => {
    const date = new Date(item.dt * 1000);
    date.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) return acc;
    
    const dateStr = date.toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date,
        dayName: getDayName(date, Object.keys(acc).length),
        weather: item.weather[0],
        temps: [],
        humidities: [],
        windSpeeds: []
      };
    }
    
    acc[dateStr].temps.push(item.main.temp);
    acc[dateStr].humidities.push(item.main.humidity);
    acc[dateStr].windSpeeds.push(item.wind.speed);
    
    return acc;
  }, {});

  // Calculate averages and format data
  const formattedForecasts = Object.values(dailyForecasts).slice(0, 5).map((day: any) => ({
    ...day,
    avgTemp: day.temps.reduce((a: number, b: number) => a + b, 0) / day.temps.length,
    avgHumidity: day.humidities.reduce((a: number, b: number) => a + b, 0) / day.humidities.length,
    avgWindSpeed: day.windSpeeds.reduce((a: number, b: number) => a + b, 0) / day.windSpeeds.length
  }));

  return (
    <div className="space-y-4">
      {formattedForecasts.map((day, index) => (
        <div key={index} className="bg-gray-200 dark:bg-gray-800 rounded-xl shadow-lg">
          <button 
            onClick={() => setExpandedDay(expandedDay === index ? null : index)}
            className="w-full p-4 text-left focus:outline-none bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{day.dayName}</span>
              <svg 
                className={`w-6 h-6 transform transition-transform ${expandedDay === index ? 'rotate-180' : ''} text-gray-600 dark:text-gray-400`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
  
          {expandedDay === index && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Image
                    src={getWeatherIconUrl(day.weather.icon)}
                    alt={day.weather.description}
                    width={100}
                    height={100}
                  />
                </div>
                <p className="mt-2 text-xl text-gray-700 dark:text-gray-300">{day.weather.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center max-w-2xl mx-auto mt-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {day.avgTemp.toFixed(1)}°C
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {Math.round(day.avgHumidity)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Humidity</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-sm mb-8">
                  <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {day.avgWindSpeed.toFixed(1)} m/s
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Forecast;