import { z } from 'zod';
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import type { GenerateContentResponse, GroundingChunk } from "@google/genai";

// Schemas
const geminiExplainResponseSchema = z.object({
  simplified: z.string(),
  practical: z.string(),
  takeaway: z.string(),
});
export type GeminiExplainResponse = z.infer<typeof geminiExplainResponseSchema>;

// Helpers
export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// FIX: Add encode function as per guidelines for Live API audio streaming.
export const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};


// Existing Functions
export async function explainClause(question: string): Promise<GeminiExplainResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are an expert Certified Welding Inspector (CWI) and a patient mentor at the MiltmonNDT Academy. Your goal is to make complex welding codes and standards (like AWS D1.1, ASME Section IX, API 1104) easy to understand for aspiring inspectors. When a student asks you about a code clause, a term, or a scenario, respond with a JSON object containing three fields: 'simplified', 'practical', and 'takeaway'. 'simplified': Break down the technical language into simple, direct terms. 'practical': Describe a real-world scenario where this clause would be important. 'takeaway': Provide a one-sentence "rule of thumb" or a simple analogy.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain: ${question}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simplified: { type: Type.STRING, description: 'The code clause, simplified into plain English.' },
            practical: { type: Type.STRING, description: 'A practical, real-world application of the clause.' },
            takeaway: { type: Type.STRING, description: 'A one-sentence key takeaway or rule of thumb.' },
          },
          required: ['simplified', 'practical', 'takeaway'],
        },
      }
    });

    const textContent = response.text;
    const parsed = geminiExplainResponseSchema.safeParse(JSON.parse(textContent));

    if (!parsed.success) {
      throw new Error('Invalid JSON content from Gemini.');
    }
    return parsed.data;

  } catch (error) {
    console.error("Error calling Gemini for explainClause:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to get AI explanation. Please try again.");
  }
}

export const generateBio = async (keywords: string, role: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const systemInstruction = `You are an expert career coach specializing in the welding and inspection industry. Generate a professional, compelling, and concise bio (around 200 characters). The tone should be confident and forward-looking. Output only the bio text.`;
  const prompt = `Role: "${role}"\nKeywords: "${keywords}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 100,
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error calling Gemini for generateBio:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to generate AI bio. Please try again.");
  }
};

// New AI Functions
let chat: Chat | null = null;
export const startChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are a helpful and friendly assistant at the MiltmonNDT Academy. Keep your answers concise and helpful.',
    },
  });
};

export const sendMessage = async (message: string): Promise<GenerateContentResponse> => {
  if (!chat) {
    startChat();
  }
  if (chat) {
     return await chat.sendMessage({ message });
  }
  throw new Error("Chat not initialized");
};


export const generateImage = async (prompt: string, aspectRatio: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });
    return response.generatedImages[0].image.imageBytes;
};

export const editImage = async (image: {inlineData: {data:string, mimeType: string}}, prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [ image, { text: prompt } ] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    const part = response.candidates[0].content.parts[0];
    if (part.inlineData) {
        return part.inlineData.data;
    }
    throw new Error("No image was generated.");
};

export const analyzeMedia = async (media: {inlineData: {data:string, mimeType: string}}, prompt: string, model: 'gemini-2.5-flash' | 'gemini-3-pro-image-preview' = 'gemini-2.5-flash') => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [ media, { text: prompt } ] },
    });
    return response.text;
};

export const transcribeAudio = async (audio: {inlineData: {data:string, mimeType: string}}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [ audio, { text: "Transcribe this audio." } ] },
  });
  return response.text;
}

export const groundedSearch = async (prompt: string, useMaps: boolean, location?: {latitude: number, longitude: number}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const tools: any[] = [{googleSearch: {}}];
  const toolConfig: any = {};

  if (useMaps) {
    tools.push({googleMaps: {}});
    if (location) {
      toolConfig.retrievalConfig = { latLng: location };
    }
  }

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools },
      toolConfig
  });
  return {
    text: response.text,
    chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const complexQuery = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: 'You are a world-class expert and researcher. Provide detailed, comprehensive, and well-structured answers to complex questions.',
        thinkingConfig: { thinkingBudget: 32768 }
      }
  });
  return response.text;
};

export const textToSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
}

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (downloadLink) {
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }
  throw new Error("Video generation failed.");
}