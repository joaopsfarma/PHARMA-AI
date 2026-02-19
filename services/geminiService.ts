
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT_DEFAULT } from "../constants.tsx";

export const generateEvolution = async (rawData: string): Promise<string> => {
  const savedKey = localStorage.getItem('PHARMA_API_KEY');
  const envKey = (window as any).process?.env?.API_KEY;
  const apiKey = savedKey || envKey;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY não encontrada. Clique na engrenagem de configurações.");
  }

  // Busca o prompt customizado que foi sincronizado do GitHub, ou usa o padrão
  const customPrompt = localStorage.getItem('PHARMA_CUSTOM_PROMPT') || SYSTEM_PROMPT_DEFAULT;

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: rawData,
      config: {
        systemInstruction: customPrompt,
        temperature: 0.1,
      },
    });

    if (!response || !response.text) {
      throw new Error("A IA não conseguiu processar estes dados.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("403") || error.message?.includes("API key")) {
      throw new Error("Chave de API inválida.");
    }
    throw new Error("Erro de comunicação com a IA.");
  }
};
