import { LineChart } from '@mui/x-charts/LineChart';
import Typography from '@mui/material/Typography';
import type { FetchDataOutput } from '../functions/useFetchData';

interface ChartUIProps {
    dataFetcherOutput: FetchDataOutput;
}

export default function ChartUI({dataFetcherOutput} : ChartUIProps) {

    const hours: Array<string> = dataFetcherOutput.data?.hourly.time.map((time) => {
        return time.split('T')[1];
    }) ?? [];

    const temperatures : Array<number> = dataFetcherOutput.data?.hourly.temperature_2m ?? []; 
    const vientos : Array<number> = dataFetcherOutput.data?.hourly.wind_speed_10m ?? []; 

   return (
      <>
         <Typography variant="h5" component="div">
            Temperatura y Velocidad del Viento por Horas
         </Typography>
         <LineChart
            height={300}
            series={[
               { data: temperatures.slice(0,10), label: 'Temperatura (°C)'},
               { data: vientos.slice(0,10), label: 'Vel. del viento (km/h)'},
            ]}
            xAxis={[{ scaleType: 'point', data: hours.slice(0,10) }]}
         />
      </>
   );
}