
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants.tsx";

export const generateEvolution = async (rawData: string): Promise<string> => {
  // Tenta buscar a chave de várias fontes possíveis em ambientes web
  const apiKey = 
    (window as any).process?.env?.API_KEY || 
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    null;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error(
      "Configuração Incompleta: A API_KEY não foi encontrada. " +
      "No Netlify, vá em Site Settings > Environment Variables e adicione API_KEY com seu valor do Google AI Studio."
    );
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
      throw new Error("A IA respondeu, mas o conteúdo está vazio.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Erro detalhado da API:", error);
    
    if (error.message?.includes("403")) {
      throw new Error("Erro 403: Sua chave de API não tem permissão ou foi bloqueada.");
    }
    if (error.message?.includes("API key not found")) {
      throw new Error("Chave de API inválida. Verifique se copiou corretamente do Google AI Studio.");
    }
    
    throw new Error("Erro na IA: " + (error.message || "Conexão interrompida."));
  }
};
