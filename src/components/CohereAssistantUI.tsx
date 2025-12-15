import { useState, useRef, useEffect } from 'react';
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import CohereAssistant from '../services/CohereAssistant';
import { type FetchDataOutput } from '../functions/useFetchData';

interface CohereAssistantUIProps {
  weatherData: FetchDataOutput;
  location?: string;
}

function CohereAssistantUI({weatherData, location = 'Ubicación actual'} : CohereAssistantUIProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{remaining: number; resetIn: number} | null>(null);
  const [assistantInitialized, setAssistantInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef<CohereAssistant | null>(null);

  // Inicializar el asistente Cohere
  useEffect(() => {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    if (!apiKey) {
      setError('API key de Cohere no configurada. Configura VITE_COHERE_API_KEY en .env');
      return;
    }
    try {
      assistantRef.current = new CohereAssistant(apiKey, 10);
      setAssistantInitialized(true);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error inicializando el asistente';
      setError(errorMessage);
    }
  }, []);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Manejar el envío de mensajes
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !assistantRef.current) {
      return;
    }
    const userMessage = input.trim();
    setInput('');
    setError(null);
    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      // Preparar contexto del clima
      const weatherContext =
        weatherData.data && !weatherData.loading
          ? {
              temperature: weatherData.data.current.temperature_2m,
              humidity: weatherData.data.current.relative_humidity_2m,
              windSpeed: weatherData.data.current.wind_speed_10m,
              location,
            }
          : undefined;
      // Enviar consulta al asistente
      const response = await assistantRef.current.query(userMessage, weatherContext);
      // Actualizar rate limit info
      if (response.rateLimitInfo) {
        const resetInMs = Math.max(0, response.rateLimitInfo.reset - Date.now());
        setRateLimitInfo({remaining: response.rateLimitInfo.remaining, resetIn: resetInMs});
      }
      if (response.success && response.message) {
        // Agregar respuesta del asistente
        setMessages((prev) => [...prev, { role: 'assistant', content: response.message || '' },]);
      } else {
        // Mostrar error
        const errorMsg = response.error || 'Error desconocido';
        setError(errorMsg);
        setMessages((prev) => [...prev, {role: 'assistant',content: `Error: ${errorMsg}`} ]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error enviando mensaje';
      setError(errorMessage);
      setMessages((prev) => [...prev, {role: 'assistant', content: `Error: ${errorMessage}`}]);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar historial
  const handleClearHistory = () => {
    if (assistantRef.current) {
      assistantRef.current.clearConversationHistory();
      setMessages([]);
      setError(null);
    }
  };

  if (!assistantInitialized && error) {
    return (
      <Paper sx={{ p: 2, bgcolor: '#fff3cd' }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!assistantInitialized) {
    return (
      <Paper sx={{ p: 2 }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        height: '600px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px',
      }}
    >
      {/* Encabezado */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🤖 Asistente de Clima (Cohere)
          </Typography>
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearHistory}
            variant="outlined"
          >
            Limpiar
          </Button>
        </Stack>
        <Divider sx={{ mt: 1 }} />
      </Box>

      {/* Información de rate limit */}
      {rateLimitInfo && (
        <Chip
          label={`Llamadas restantes: ${rateLimitInfo.remaining}/10`}
          size="small"
          sx={{ mb: 1, width: 'fit-content' }}
          color={rateLimitInfo.remaining > 3 ? 'primary' : 'warning'}
          variant="outlined"
        />
      )}

      {/* Área de mensajes */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          mb: 2,
          p: 1.5,
          backgroundColor: '#fff',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.length === 0 && (
          <Typography
            variant="body2"
            sx={{ color: '#999', textAlign: 'center', mt: 3 }}
          >
            Inicia una conversación sobre el clima. El asistente usará los datos
            actuales de tu selección.
          </Typography>
        )}

        {messages.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              p: 1.5,
              borderRadius: '4px',
              backgroundColor:
                msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              borderLeft:
                msg.role === 'user'
                  ? '4px solid #2196f3'
                  : '4px solid #666',
              wordBreak: 'break-word',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
              {msg.role === 'user' ? '👤 Tú' : '🤖 Asistente'}
            </Typography>
            <Typography variant="body2">{msg.content}</Typography>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CircularProgress size={20} />
            <Typography variant="caption">El asistente está pensando...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Área de entrada */}
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Escribe tu pregunta sobre el clima..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || !assistantInitialized}
          multiline
          maxRows={3}
          variant="outlined"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !input.trim() || !assistantInitialized}
          endIcon={<SendIcon />}
          sx={{ px: 2 }}
        >
          Enviar
        </Button>
      </Box>
    </Paper>
  );
};

export default CohereAssistantUI;