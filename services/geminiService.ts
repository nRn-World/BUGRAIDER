
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'PLACEHOLDER_API_KEY') {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  // Gemini AI initialization failed, using fallback mode
}

export const getGameTip = async (): Promise<string> => {
  if (!ai) {
    return "Använd neon-hoppet för att nå högre!";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: "Ge ett kort, roligt och engagerande speltips för plattformsspelet 'Shadow Paw: Neon Mission'. Fokusera på att katten försöker fånga bytet. Max 15 ord. Svara på svenska.",
      config: {
        systemInstruction: "Du är en spelguide för barn i en neon-värld där en katt är hjälten.",
      },
    });
    return response.text.trim() || "Använd neon-hoppet för att nå högre!";
  } catch {
    return "Håll utkik efter vakthundarna!";
  }
};

export const getJerryTaunt = async (score: number): Promise<string> => {
  if (!ai) {
    return score > 100 ? "Bra kämpat, men bytet var snabbare!" : "Du hann inte ifatt mig!";
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Katten förlorade i 'Shadow Paw' med poängen ${score}. Skriv ett kort hån från bytet till katten. Var lekfull men snäll. Max 15 ord. Svara på svenska.`,
    });
    return response.text.trim() || "Bättre lycka nästa gång, katten!";
  } catch (error) {
    return "Du hann inte ifatt mig!";
  }
};