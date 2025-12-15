import Box from '@mui/material/Box';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import type { FetchDataOutput } from '../functions/useFetchData';

interface TableUIProps {
    dataFetcherOutput: FetchDataOutput;
}


function combineArrays(arrLabels: Array<string>, arrLabels1: Array<string>, arrValues1: Array<number>, arrValues2: Array<number>) {
   return arrLabels.map((label, index) => ({
      id: index,
      label: label,
      label1: arrLabels1[index],
      value1: arrValues1[index],
      value2: arrValues2[index]
   }));
}

const columns: GridColDef[] = [
   { field: 'id', headerName: 'ID', width: 90 },
   {
      field: 'label',
      headerName: 'Fecha',
      width: 125,
   },
   {
      field: 'label1',
      headerName: 'Hora',
      width: 125,
   },
   {
      field: 'value1',
      headerName: 'Temperatura',
      width: 125,
   },
   {
      field: 'value2',
      headerName: 'Vel. viento',
      width: 125,
   },
   {
      field: 'resumen',
      headerName: 'Resumen',
      description: 'No es posible ordenar u ocultar esta columna.',
      sortable: false,
      hideable: false,
      width: 100,
      valueGetter: (_, row) => `${row.label || ''} ${row.label1 || ''} ${row.value1 || ''} ${row.value2 || ''}`,
   },
];


export default function TableUI({dataFetcherOutput}: TableUIProps) {

    const dates: Array<string> = dataFetcherOutput.data?.hourly.time.map((time) => {
        return time.split('T')[0];
    }) ?? [];

    const hours: Array<string> = dataFetcherOutput.data?.hourly.time.map((time) => {
        return time.split('T')[1];
    }) ?? [];

    const temperatures : Array<number> = dataFetcherOutput.data?.hourly.temperature_2m ?? []; 
    const vientos : Array<number> = dataFetcherOutput.data?.hourly.wind_speed_10m ?? []; 

    const rows = combineArrays(dates, hours, temperatures, vientos);

    return (
        <Box sx={{ height: 350, width: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 5,
                    },
                },
                }}
                pageSizeOptions={[5]}
                disableRowSelectionOnClick
            />
        </Box>
    );
}
