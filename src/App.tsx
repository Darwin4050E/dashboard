// Darwin Díaz González - DAWM - P2

import './App.css'
import { Grid } from '@mui/material';
import HeaderUI from './components/HeaderUI';
import AlertUI from './components/AlertUI';
import SelectorUI from './components/SelectorUI';
import IndicatorUI from './components/IndicatorUI';

// 11. Se importa el custom hook y el tipo FetchDataOutput.

import useFetchData from './functions/useFetchData';
import { type FetchDataOutput } from './functions/useFetchData';

import TableUI from './components/TableUI';
import ChartUI from './components/ChartUI';

// 12. Se utiliza el custom hook. Ciertos componentes serán renderizados solo si ciertos valores del custom hook existen.

import {useState} from 'react';

function App() {

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dataFetcherOutput : FetchDataOutput = useFetchData(selectedOption);

  return (
    <Grid container spacing={5} justifyContent="center" alignItems="center">

      {/* Encabezado */}
      <Grid size={{ xs: 12, md: 12 }}>
        <HeaderUI/>
      </Grid>

      {/* Alertas */}
      <Grid size={{ xs: 12, md: 12 }} container justifyContent="right" alignItems="center">
        <AlertUI description="No se preveen lluvias" severity="success" variant="outlined"/>
      </Grid>

      {/* Selector */}
      <Grid size={{ xs: 12, md: 3 }}>
        <SelectorUI onOptionSelect={setSelectedOption}/>
      </Grid>

      {/* Indicadores */}
      <Grid size={{ xs: 12, md: 9 }} container justifyContent="center" alignItems="center">
        {dataFetcherOutput.loading && <p>Cargando datos...</p>}
        {dataFetcherOutput.error && <p>Error: {dataFetcherOutput.error}</p>}
        {dataFetcherOutput.data && 
          <>
            {/*<Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Temperatura (2m)' description='XX °C'/></Grid>*/}
            <Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Temperatura (2m)' description={`${dataFetcherOutput.data.current.temperature_2m} ${dataFetcherOutput.data.current_units.temperature_2m}`}/></Grid>
            {/*<Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Temperatura aparente' description='YY °C'/></Grid>*/}
            <Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Temperatura aparente' description={`${dataFetcherOutput.data.current.apparent_temperature} ${dataFetcherOutput.data.current_units.apparent_temperature}`}/></Grid>
            {/*<Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Velocidad del viento' description='ZZ km/h'/></Grid>*/}
            <Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Velocidad del viento' description={`${dataFetcherOutput.data.current.wind_speed_10m} ${dataFetcherOutput.data.current_units.wind_speed_10m}`}/></Grid>
            {/*<Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Humedad relativa' description='HH %'/></Grid>*/}
            <Grid size={{ xs: 12, md: 3 }}><IndicatorUI title='Humedad relativa' description={`${dataFetcherOutput.data.current.relative_humidity_2m} ${dataFetcherOutput.data.current_units.relative_humidity_2m}`}/></Grid>
          </>
        }
        
      </Grid>

      {/* Gráfico */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "block"} }}>
        <ChartUI dataFetcherOutput={dataFetcherOutput}/>
      </Grid>

      {/* Tabla */}
      <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: "none", md: "block" } }}>
        <TableUI dataFetcherOutput={dataFetcherOutput}/>
      </Grid>

      {/* Información adicional */}
      <Grid size={{ xs: 12, md: 12 }}>
        Elemento: Información adicional
      </Grid>

    </Grid >
  );
}

export default App
