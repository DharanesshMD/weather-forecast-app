export const mockWeatherData = {
    name: 'London',
    main: {
      temp: 20,
      feels_like: 22,
      humidity: 70,
      pressure: 1015,
      temp_min: 18,
      temp_max: 23
    },
    weather: [{
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d'
    }],
    wind: {
      speed: 4.12,
      deg: 300
    },
    sys: {
      country: 'GB',
      sunrise: 1645123456,
      sunset: 1645167890
    },
    coord: {
      lat: 51.5074,
      lon: -0.1278
    }
  }
  
  export const mockForecastData = {
    list: [
      {
        dt: 1645123456,
        main: {
          temp: 20,
          feels_like: 22,
          humidity: 70,
          pressure: 1015
        },
        weather: [{
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        wind: {
          speed: 4.12,
          deg: 300
        }
      },
      // Add more forecast entries as needed
    ],
    city: {
      name: 'London',
      country: 'GB',
      coord: {
        lat: 51.5074,
        lon: -0.1278
      }
    }
  }
  
  export const mockSuggestions = [
    { name: 'London, GB' },
    { name: 'London, CA' },
    { name: 'London, KY, US' }
  ]