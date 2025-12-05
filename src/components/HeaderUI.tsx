// 1. Se importa Typography desde su dirección. G13.
import Typography from "@mui/material/Typography";

// 2. Se crea el componente HeaderUI. G13.
function HeaderUI(){
    // 3. Se retorna el componente Typography con el texto Dashboard y ciertas características. G13.
    return <Typography variant="h2" component="h1" sx={{fontWeight: "bold"}}>Dashboard del clima</Typography>;
}

// 2. Se exporta el componente HeaderUI. G13.
export default HeaderUI;