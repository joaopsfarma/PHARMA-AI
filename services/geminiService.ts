
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants.tsx";

export const generateEvolution = async (rawData: string): Promise<string> => {
  // Acesso seguro ao process.env para evitar ReferenceError em navegadores puros
  let apiKey: string | undefined;
  
  try {
    apiKey = (window as any).process?.env?.API_KEY || (process as any)?.env?.API_KEY;
  } catch (e) {
    console.warn("Ambiente process.env não detectado, tentando métodos alternativos.");
  }

  if (!apiKey) {
    throw new Error("API Key não configurada. Por favor, verifique as configurações do ambiente.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: rawData,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
      },
    });

    if (!response || !response.text) {
      throw new Error("A IA retornou uma resposta vazia.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("403") || error.message?.includes("API key")) {
      throw new Error("Sua chave de API parece ser inválida ou não tem permissão para este modelo.");
    }
    throw new Error("Erro ao processar dados com a IA: " + (error.message || "Erro desconhecido"));
  }
};
