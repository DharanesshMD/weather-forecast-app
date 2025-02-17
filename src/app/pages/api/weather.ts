import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req.query;

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        q: query,
        units: 'metric',
        appid: API_KEY,
      },
    });
    res.status(200).json(response.data);
  } catch (err) {
    // Log the error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Weather API Error:', err);
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};