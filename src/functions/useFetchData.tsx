// Darwin Díaz González - DAWM - P2

// 1. Se importan los hooks useState y useEffect de React, además del tipo OpenMeteoResponse.

import { useState, useEffect } from 'react';
import { type OpenMeteoResponse } from '../types/DashboardTypes';
// 2. Se define la estructura del objeto que retornará la función useFetchData.

export interface FetchDataOutput {
    data: OpenMeteoResponse | null;  // Datos obtenidos de la API o null si hay un error
    loading: boolean;  // Indica si la solicitud está en curso.
    error: string | null;  // Mensaje de error si ocurre un problema, o null si todo va bien.
}

// 3. Se crea el custom hook "useFetchData" que retorna un objeto de tipo FetchDataOutput.

function useFetchData(selectedOption : string | null) : FetchDataOutput {

    // API.

    const CITY_COORDS: Record<string, {latitude: number, longitude: number}> = {
        "guayaquil": {latitude: -2.1962, longitude: -79.8862},
        "quito": {latitude: -0.1807, longitude: -78.4678},
        "manta": {latitude: -0.9470, longitude: -80.7080},
        "cuenca": {latitude: -2.9006, longitude: -79.0045}
    };

    // 4. Se definen los estados del hook: datos, carga y error.

    const [data, setData] = useState<OpenMeteoResponse | null>(null);  // La respuesta de la API puede ser del tipo OpenMeteoResponse o null si hay un error.
    const [loading, setLoading] = useState<boolean>(true);  // Inicia en true porque caundo el componente se renderiza por primera vez, la solicitud aún no se ha completado.
    const [error, setError] = useState<string | null>(null);  // Inicia en null porque al principio no hay errores.

    // 5. Se utiliza useEffect para realizar la solicitud a la API.

    useEffect(() => {

        const cityConfig = selectedOption != null ? CITY_COORDS[selectedOption] : CITY_COORDS["guayaquil"];
        const URL = `https://api.open-meteo.com/v1/forecast?latitude=${cityConfig.latitude}&longitude=${cityConfig.longitude}&hourly=temperature_2m,wind_speed_10m&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m`;

        // useEffect no puede recibir directamente una función asíncrona, por lo que se la define dentro de fetchData y luego se la usa.

        const fetchData = async () => {

            try {

                const response = await fetch(URL);

                if(!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Transforma el JSON a un objeto de tipado como OpenMeteoResponse.

                const data: OpenMeteoResponse = await response.json();

                // 6. Se actualiza el estado "data" con los datos obtenidos.

                setData(data);

            } catch (error) {
                
                // 7. Se verifica que "err" sea una instancia de "Error" para poder acceder a message. Si no lo es, se convierte a string.

                if(error instanceof Error) {

                    // 8. Se actualiza el estado "error" con el mensaje del error.

                    setError(error.message);

                } else {

                    setError(String(error));

                }

            } finally {

                // 9. Se actualiza el estado "loading" a false ya sea que la solicitud haya tenido éxito o haya fallado.

                setLoading(false);

            }

        }

        fetchData();

    }, [selectedOption]);

    // 10. Se retorna un objeto con los estados "data", "loading" y "error".

    return { data, loading, error };

}

export default useFetchData;