// CohereAssistant - Servicio para interactuar con la API de Cohere
// Maneja consultas sobre el clima con rate limiting y manejo de errores

import { CohereClientV2 } from 'cohere-ai';

interface RateLimitControl {
  maxCallsPerMinute: number;
  currentCalls: number;
  resetTime: number;
}

interface CohereMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CohereResponse {
  success: boolean;
  message?: string;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    reset: number;
  };
}

class CohereAssistant {
  private client: CohereClientV2;
  private rateLimitControl: RateLimitControl;
  private conversationHistory: CohereMessage[] = [];

  constructor(apiKey: string, maxCallsPerMinute: number = 10) {
    this.client = new CohereClientV2({
      token: apiKey,
    });

    this.rateLimitControl = {
      maxCallsPerMinute,
      currentCalls: 0,
      resetTime: Date.now() + 60000, // 1 minuto
    };
  }

  /**
   * Verifica y controla el rate limiting
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    // Si pasó más de 1 minuto, reiniciar contador
    if (now > this.rateLimitControl.resetTime) {
      this.rateLimitControl.currentCalls = 0;
      this.rateLimitControl.resetTime = now + 60000;
    }

    // Si llegó al límite, rechazar
    if (this.rateLimitControl.currentCalls >= this.rateLimitControl.maxCallsPerMinute) {
      return false;
    }

    this.rateLimitControl.currentCalls++;
    return true;
  }

  /**
   * Obtiene información del rate limit
   */
  getRateLimitInfo(): {
    remaining: number;
    reset: number;
    resetIn: number;
  } {
    const remaining =
      this.rateLimitControl.maxCallsPerMinute -
      this.rateLimitControl.currentCalls;
    const resetIn = Math.max(0, this.rateLimitControl.resetTime - Date.now());

    return {
      remaining,
      reset: this.rateLimitControl.resetTime,
      resetIn,
    };
  }

  /**
   * Envía una consulta a la API de Cohere
   * Documentación: https://docs.cohere.com/reference/chat
   */
  async query(
    userMessage: string,
    weatherContext?: {
      temperature?: number;
      humidity?: number;
      windSpeed?: number;
      location?: string;
    }
  ): Promise<CohereResponse> {
    try {
      // Validar que el mensaje no esté vacío
      if (!userMessage.trim()) {
        return {
          success: false,
          error: 'El mensaje no puede estar vacío',
        };
      }

      // Validar rate limit
      if (!this.checkRateLimit()) {
        const rateLimitInfo = this.getRateLimitInfo();
        return {
          success: false,
          error: `Límite de llamadas alcanzado. Intenta de nuevo en ${Math.ceil(
            rateLimitInfo.resetIn / 1000
          )} segundos`,
          rateLimitInfo,
        };
      }

      // Construir el contexto de clima
      let contextMessage = userMessage;
      if (weatherContext) {
        contextMessage = `
        Contexto del clima actual:
        - Temperatura: ${weatherContext.temperature}°C
        - Humedad relativa: ${weatherContext.humidity}%
        - Velocidad del viento: ${weatherContext.windSpeed} km/h
        - Ubicación: ${weatherContext.location || 'No especificada'}

        Consulta del usuario: ${userMessage}
        `.trim();
      }

      // Agregar mensaje del usuario al historial
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Construir mensajes con instrucción de sistema
      const messagesWithSystem = [
        {
          role: 'user' as const,
          content: `Eres un asistente experto en clima y meteorología. Responde de manera clara, concisa y en español sobre consultas relacionadas con el clima. Proporciona información útil y práctica. Si tienes contexto del clima actual, úsalo para dar respuestas más relevantes.\n\n${contextMessage}`,
        },
      ];

      // Hacer la llamada a la API de Cohere v2
      const response = await this.client.chat({
        model: 'command-r-plus-08-2024',
        messages: messagesWithSystem,
        maxTokens: 1024,
      } as Parameters<typeof this.client.chat>[0]);

      // Procesar respuesta
      if (response.message?.content) {
        let assistantMessage = '';
        
        // Extraer texto de la respuesta
        if (Array.isArray(response.message.content)) {
          assistantMessage = response.message.content
            .filter((item: unknown) => {
              return typeof item === 'object' && item !== null && 'type' in item && (item as {type: string}).type === 'text';
            })
            .map((item: unknown) => {
              return (item as {text?: string}).text || '';
            })
            .join('');
        } else if (typeof response.message.content === 'string') {
          assistantMessage = response.message.content;
        }

        if (assistantMessage) {
          // Agregar respuesta del asistente al historial
          this.conversationHistory.push({
            role: 'assistant',
            content: assistantMessage,
          });

          const rateLimitInfo = this.getRateLimitInfo();

          return {
            success: true,
            message: assistantMessage,
            rateLimitInfo,
          };
        }
      }

      return {
        success: false,
        error: 'No se recibió respuesta válida de la API',
      };
    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        
        // Error de autenticación
        if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
          return {
            success: false,
            error: 'Error de autenticación. Verifica tu API key de Cohere',
          };
        }

        // Error de rate limit de Cohere
        if (errorMsg.includes('429') || errorMsg.includes('too many requests')) {
          return {
            success: false,
            error: 'La API de Cohere tiene demasiadas solicitudes. Intenta más tarde',
          };
        }

        // Error de conexión
        if (errorMsg.includes('econnrefused') || errorMsg.includes('fetch')) {
          return {
            success: false,
            error: 'Error de conexión. Verifica tu conexión a internet',
          };
        }

        // Error genérico
        return {
          success: false,
          error: `Error: ${error.message}`,
        };
      }

      return {
        success: false,
        error: 'Error desconocido al consultar la API',
      };
    }
  }

  /**
   * Obtiene el historial de conversación
   */
  getConversationHistory(): CohereMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Limpia el historial de conversación
   */
  clearConversationHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Obtiene la última respuesta del asistente
   */
  getLastResponse(): string | null {
    const lastMessage = this.conversationHistory[
      this.conversationHistory.length - 1
    ];
    return lastMessage?.role === 'assistant' ? lastMessage.content : null;
  }
}

export default CohereAssistant;
export type { CohereResponse, CohereMessage };
