import { useEffect, useState } from 'react';
import { type OpenMeteoResponse } from '../types/DashboardTypes';

function useFetchData() : OpenMeteoResponse | null {
    const  URL = 'https://api.open-meteo.com/v1/forecast?latitude=-1.25&longitude=-78.25&hourly=temperature_2m&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m';
    const [data, setData] = useState<OpenMeteoResponse | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(URL);
                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: OpenMeteoResponse = await response.json();
                setData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        fetchData();
    }, []);
    return data;
}

export default useFetchData;