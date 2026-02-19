
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants.tsx";

export const generateEvolution = async (rawData: string): Promise<string> => {
  // Garantir que a API Key existe antes de inicializar
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key não encontrada no ambiente.");
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

    return response.text || "Não foi possível gerar a evolução.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Erro na comunicação com a inteligência artificial. Verifique sua conexão.");
  }
};
