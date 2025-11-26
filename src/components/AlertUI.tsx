// 5. Se crea AlertUI.tsx y se importa Alert. G13.
import Alert from '@mui/material/Alert';

// 7. Se crea la interfaz AlertConfig. G13.
interface AlertConfig {
    description: string,
    severity ?: 'error' | 'warning' | 'info' | 'success',
    variant ?: 'filled' | 'outlined' | 'standard'
}

// 6. Se crea el componente AlertUI. G13.
// 8. Se utiliza la interfaz AlertConfig para tipar las props del componente. G13.
function AlertUI(config: AlertConfig) {
    // 9. Se retorna el componente Alert con la descripción pasada por props y ciertas características. G13.
    return <Alert severity={config.severity} variant={config.variant}>{config.description}</Alert>
}

// 8. Se exporta el componente AlertUI. G13.
export default AlertUI;