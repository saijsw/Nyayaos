import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getLegalCostEstimate = async (caseType: string, courtLevel: string, durationMonths: number) => {
  const prompt = `As a legal cost estimator for NyayaOS Civic, provide a JSON estimate for a ${caseType} case at the ${courtLevel} level expected to last ${durationMonths} months. 
  Include: 
  - baseFee (number)
  - monthlyRetainer (number)
  - totalEstimatedCost (number)
  - riskFactor (0-1)
  - breakdown (array of {item: string, cost: number})
  Return ONLY JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
};
