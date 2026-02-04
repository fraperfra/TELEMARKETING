import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

const openai = apiKey
  ? new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    })
  : null;

export const isOpenAIConfigured = !!apiKey;

export { openai };

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Generate script suggestions for a sales call
 */
export const generateCallScript = async (
  ownerName: string,
  propertyInfo: string,
  context?: string
): Promise<AIResponse> => {
  if (!openai) {
    return { success: false, error: 'OpenAI not configured' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto di telemarketing immobiliare italiano.
Genera uno script di chiamata professionale e convincente.
Rispondi in italiano.`,
        },
        {
          role: 'user',
          content: `Genera uno script per chiamare ${ownerName} riguardo alla proprieta: ${propertyInfo}.
${context ? `Contesto aggiuntivo: ${context}` : ''}`,
        },
      ],
      max_tokens: 500,
    });

    return {
      success: true,
      data: response.choices[0]?.message?.content || '',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Generate objection handling suggestions
 */
export const handleObjection = async (objection: string): Promise<AIResponse> => {
  if (!openai) {
    return { success: false, error: 'OpenAI not configured' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Sei un esperto di vendite immobiliari.
Fornisci risposte professionali alle obiezioni dei clienti.
Rispondi in italiano con 2-3 alternative di risposta.`,
        },
        {
          role: 'user',
          content: `Il cliente ha detto: "${objection}". Come posso rispondere?`,
        },
      ],
      max_tokens: 300,
    });

    return {
      success: true,
      data: response.choices[0]?.message?.content || '',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Summarize call notes
 */
export const summarizeCall = async (notes: string): Promise<AIResponse> => {
  if (!openai) {
    return { success: false, error: 'OpenAI not configured' };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Riassumi le note della chiamata in modo conciso.
Estrai: risultato, prossimi passi, punti chiave.
Rispondi in italiano.`,
        },
        {
          role: 'user',
          content: notes,
        },
      ],
      max_tokens: 200,
    });

    return {
      success: true,
      data: response.choices[0]?.message?.content || '',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
