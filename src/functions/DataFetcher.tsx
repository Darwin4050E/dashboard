import { useState } from "react";
import { useEffect } from "react";

import { type OpenMeteoResponse } from "../types/DashboardTypes";

interface DataFetcherOutput {
    data: OpenMeteoResponse | null;
    loading: boolean;
    error: String | null;
}

function DataFetcher() : DataFetcherOutput {
    const [data, setData] = useState<OpenMeteoResponse | null>(null);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<String | null>(null);
    
    useEffect(() => {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m&timezone=America%2FChicago";
        const fetchData = async () => {
            try{
                const response = await fetch(url);
                if(!response.ok){
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result: OpenMeteoResponse = await response.json();
                setData(result);
            }catch(err: any){
                if(err instanceof Error){
                    setError(err.message);
                }else{
                    setError("Ocurrió un error desconocido al obtener los datos.");
                }
            }finally{
                setLoading(false);
            }
        }
        fetchData();
    }, []);
    return { data, loading, error };
}

export default DataFetcher;