
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

/**
 * Busca a chave API de forma segura.
 * Prioridade: 
 * 1. Objeto Global window.process (injetado por ferramentas de build ou nosso polifill)
 * 2. LocalStorage (salvo durante o onboarding)
 */
const getApiKey = (): string => {
  let key = '';
  
  try {
    // Acesso ultra-seguro para evitar ReferenceError
    if (typeof window !== 'undefined') {
      const globalProcess = (window as any).process;
      if (globalProcess && globalProcess.env && globalProcess.env.API_KEY) {
        key = globalProcess.env.API_KEY;
      }
    }
    
    if (!key && typeof localStorage !== 'undefined') {
      key = localStorage.getItem('VIC_API_KEY') || '';
    }
  } catch (e) {
    console.warn("Erro ao acessar armazenamento de chaves:", e);
  }

  return key;
};

const getAI = () => {
  const key = getApiKey();
  if (!key || key.length < 10) {
    throw new Error("CHAVE_AUSENTE");
  }
  return new GoogleGenAI({ apiKey: key });
};

async function handleGeminiError(error: any) {
  const errorMessage = error?.message || "";
  console.error("Gemini API Error:", errorMessage);
  
  if (errorMessage === "CHAVE_AUSENTE" || 
      errorMessage.includes("API_KEY_INVALID") || 
      errorMessage.includes("Requested entity was not found")) {
    
    // Se estiver no ambiente específico do Google, tenta abrir o seletor deles
    if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    } else {
      // Se estiver na Hostinger/Web normal, remove a chave inválida para forçar novo input
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('VIC_API_KEY');
      }
      // Avisa o usuário que a chave deu erro
      alert("A chave API do Gemini parece ser inválida. Por favor, configure uma nova no próximo passo.");
      window.location.reload();
    }
  }
  throw error;
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export async function* getVicStreamingResponse(message: string, level: string, name: string, interests: string[], history: any[] = []) {
  try {
    const ai = getAI();
    const stream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: SYSTEM_PROMPT(level, name, interests),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response_text: { type: Type.STRING },
            correction_hint: { type: Type.STRING }
          },
          required: ["response_text", "correction_hint"]
        }
      }
    });
    for await (const chunk of stream) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  } catch (error) { await handleGeminiError(error); }
}

export const speakWithVic = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) { return handleGeminiError(error); }
};

export async function getProVicResponse(query: string, level: string, name: string, interests: string[]) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction: SYSTEM_PROMPT(level, name, interests),
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text;
  } catch (error) { return handleGeminiError(error); }
}

export async function getSearchGroundedResponse(query: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: query,
      config: { tools: [{ googleSearch: {} }] },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = chunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];
    return { text: response.text, sources: [...new Set(sources)] as string[] };
  } catch (error) { return handleGeminiError(error); }
}

export async function analyzeImage(base64: string, mimeType: string, prompt: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] }
    });
    return response.text;
  } catch (error) { return handleGeminiError(error); }
}

export async function analyzeVideo(base64: string, mimeType: string, prompt: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { data: base64, mimeType } }, { text: prompt }] }
    });
    return response.text;
  } catch (error) { return handleGeminiError(error); }
}
