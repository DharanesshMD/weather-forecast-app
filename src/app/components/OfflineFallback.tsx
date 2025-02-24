import React from 'react';
import { RiWifiOffLine } from 'react-icons/ri';

const OfflineFallback = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
        <RiWifiOffLine className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          No Internet Connection
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please check your network connection and try again.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Retry Connection
          </button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Weather data will be available once you are back online
          </p>
        </div>
      </div>
    </div>
  );
};

export default OfflineFallback;