
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useState } from 'react';

interface SelectorProps {
    onOptionSelect: (option: string) => void;
}

function SelectorUI({onOptionSelect}: SelectorProps) {
    const [cityInput, setCityInput] = useState("");
    const handleChange = (event: SelectChangeEvent<string>) => {
        // window.alert(`Ciudad seleccionada: ${event.target.value}`);
        setCityInput(event.target.value);
        onOptionSelect(event.target.value);
    }
    return (
        <FormControl fullWidth>
            <InputLabel id="city-select-label">Ciudad</InputLabel>
            <Select labelId="city-select-label" id="city-simple-select" label="Ciudad" onChange={handleChange} value={cityInput}>
                <MenuItem disabled><em>Seleccione una ciudad</em></MenuItem>
                <MenuItem value={'guayaquil'}>Guayaquil</MenuItem>
                <MenuItem value={'quito'}>Quito</MenuItem>
                <MenuItem value={'manta'}>Manta</MenuItem>
                <MenuItem value={'cuenca'}>Cuenca</MenuItem>
            </Select>
            {cityInput && (<p style={{textAlign: "center"}}>Información del clima en <span style={{fontWeight: "bold", textTransform: "capitalize"}}>{cityInput}</span></p>)}
        </FormControl>
    );
}

export default SelectorUI;