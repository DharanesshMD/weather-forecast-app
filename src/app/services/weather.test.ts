import fetchMock from 'jest-fetch-mock';
import { mockForecastData, mockWeatherData } from "../mocks/weatherMocks";
import { fetchForecast, fetchWeather } from "./weather";

// Enable fetch mocks
fetchMock.enableMocks();

describe('Weather Service', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('fetchWeather', () => {
    it('fetches current weather successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockWeatherData));

      const result = await fetchWeather('London');
      
      expect(result).toEqual(mockWeatherData);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/weather?q=London')
      );
    });

    it('handles fetch error correctly', async () => {
      fetchMock.mockRejectOnce(new Error('Failed to fetch'));

      await expect(fetchWeather('InvalidCity')).rejects.toThrow('Failed to fetch');
    });
  });

  describe('fetchForecast', () => {
    it('fetches forecast data successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockForecastData));

      const result = await fetchForecast('London');
      
      expect(result).toEqual(mockForecastData);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/forecast?q=London')
      );
    });

    it('handles fetch error correctly', async () => {
      fetchMock.mockRejectOnce(new Error('Failed to fetch'));

      await expect(fetchForecast('InvalidCity')).rejects.toThrow('Failed to fetch');
    });
  });
});