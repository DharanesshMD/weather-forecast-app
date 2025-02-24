"use client";

import { fetchDefaultWeather, fetchWeather } from './services/weather';
import { lazy, Suspense, useEffect, useState } from 'react';
import gsap from 'gsap';
import OfflineFallback from './components/OfflineFallback';

const AutoCompleteSearch = lazy(() => import('./components/AutoCompleteSearch'));
const CurrentWeather = lazy(() => import('./components/CurrentWeather'));
const Forecast = lazy(() => import('./components/Forecast'));
const Map = lazy(() => import('./components/Map'));

const Home = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Start with a fixed initial state
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme after mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    setIsDarkMode(storedTheme === 'dark' || storedTheme === null);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Only update localStorage and classes after initialization
    if (isInitialized) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, isInitialized]);

  useEffect(() => {
    // GSAP animation only
    const tl = gsap.timeline({ repeat: -1 });
    tl.to(".animated-title", 30, { backgroundPosition: "-960px 0" });

    return () => {
      tl.kill(); // Cleanup animation on unmount
    };
  }, []);

  useEffect(() => {
    const fetchDefaultWeatherData = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const data = await fetchDefaultWeather(latitude, longitude);
            await fetchWeather(data.name);
          } catch (error) {
            console.error('Failed to fetch default weather data:', error);
          }
        }, () => {
          // Fallback to New York if geolocation is not available
          fetchWeather('New York');
        });
      } else {
        fetchWeather('New York');
      }
    };

    fetchDefaultWeatherData();

    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    return () => {
      window.removeEventListener('online', () => setIsOnline(true));
      window.removeEventListener('offline', () => setIsOnline(false));
    };
  }, []);

  if (!isOnline) {
    return <OfflineFallback />;
  }

  return (
    <div className="min-h-screen dark:bg-gray-900 relative">
      {/* toggle for pc screen */}
      <label 
        id="theme-toggle-button" 
        className="hidden sm:block absolute top-4 right-4 z-10 cursor-pointer w-16"
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
      </label>
      {/* toggle for mobile screen */}
      <label 
        id="theme-toggle" 
        className="absolute left-1/2 -translate-x-1/2 top-4 z-10 cursor-pointer w-16 sm:hidden"
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
      </label>

      <div className="container mx-auto p-4">
        {/* Add a container div with gray background and rounded edges */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-10 shadow-lg mb-8">
          <div className="flex flex-col items-center gap-8">
            <div className="flex justify-center items-center mb-10">
            <h1 className="animated-title text-6xl md:text-8xl text-center font-montserrat max-w-[100%] bg-clip-text text-transparent bg-fixed"
    style={{
      backgroundImage: isDarkMode 
        ? "url(https://cdn.pixabay.com/photo/2017/07/03/20/17/abstract-2468874_960_720.jpg)"
        : "url(https://images.pexels.com/photos/416920/pexels-photo-416920.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}>
  Welcome to Advanced Weather Forecast App!
</h1>
            </div>

            <div className="w-full max-w-4xl flex justify-center items-center">
              <Suspense fallback={<div className="h-16 w-full bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"></div>}>
                <AutoCompleteSearch />
              </Suspense>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Suspense fallback={<div className="h-64 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <CurrentWeather />
          </Suspense>
          <Suspense fallback={<div className="h-64 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <Forecast />
          </Suspense>
        </div>
        {/* <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setUnit(unit === 'metric' ? 'imperial' : 'metric')}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('switchUnit', { unit: unit === 'metric' ? 'Fahrenheit' : 'Celsius' })}
          </button>
        </div> */}
        <div className="mt-4">
          <Suspense fallback={<div className="h-64 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg"></div>}>
            <Map />
          </Suspense>
        </div>
        {/* {!isOnline && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded text-red-700">
            {t('offline')}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Home;