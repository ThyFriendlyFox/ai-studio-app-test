import { GoogleGenAI, Type } from "@google/genai";
import { FixPlan, StoreLocation } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Analyzes an image or text description of a home issue and returns a structured FixPlan.
 */
export const analyzeIssue = async (description: string, imageBase64?: string): Promise<FixPlan> => {
  const model = "gemini-2.5-flash"; // Good for text/vision analysis
  
  const prompt = `
    You are HandyMate, a calm, patient friend who is really good with tools. 
    The user is likely feeling anxious about a home repair.
    Analyze the following home maintenance issue. 
    Provide a step-by-step fix guide that is hyper-practical.
    
    Tone: "I totally got this", reassuring, simple.
    
    Return the result strictly as JSON matching this schema:
    {
      title: string,
      difficulty: 'Easy' | 'Medium' | 'Hard',
      estimatedTime: string,
      safetyWarning: string,
      tools: [{ name: string, estimatedPrice: string, isCommon: boolean }],
      steps: [{ stepNumber: integer, instruction: string, detail: string, visualPrompt: string }]
    }
    
    For 'visualPrompt', write a concise description of what a simple line-drawing diagram of this step should look like (e.g., "A hand turning a valve clockwise").
  `;

  const parts: any[] = [{ text: prompt }];
  
  if (imageBase64) {
    // Remove header if present (e.g., data:image/jpeg;base64,)
    const cleanBase64 = imageBase64.split(',')[1];
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: cleanBase64
      }
    });
  } 
  
  parts.push({ text: `User description: ${description}` });

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
          estimatedTime: { type: Type.STRING },
          safetyWarning: { type: Type.STRING },
          tools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                estimatedPrice: { type: Type.STRING },
                isCommon: { type: Type.BOOLEAN },
              }
            }
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                instruction: { type: Type.STRING },
                detail: { type: Type.STRING },
                visualPrompt: { type: Type.STRING },
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) throw new Error("Failed to analyze issue");
  
  try {
    const parsed = JSON.parse(response.text);
    
    // Safety: Ensure arrays exist to prevent "Cannot read properties of undefined (reading 'length')"
    if (!parsed.steps) parsed.steps = [];
    if (!parsed.tools) parsed.tools = [];
    
    return parsed as FixPlan;
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    throw new Error("Could not understand the repair plan. Please try again.");
  }
};

/**
 * Generates a diagrammatic image for a specific step.
 */
export const generateStepDiagram = async (visualPrompt: string): Promise<string> => {
  // Using gemini-2.5-flash-image for generation as per instructions
  const model = "gemini-2.5-flash-image"; 
  
  const fullPrompt = `Create a clean, simple, instructional line-drawing diagram on an ivory (#FFF8E1) background. 
  Style: Field Notes sketch, technical but hand-drawn vibe, minimal clutter, friendly.
  Subject: ${visualPrompt}`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [{ text: fullPrompt }] },
    config: {
        // No specific imageConfig for 2.5-flash-image needed unless aspect ratio changes
    }
  });

  // Extract image
  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
              imageUrl = `data:image/png;base64,${part.inlineData.data}`;
              break;
          }
      }
  }

  if (!imageUrl) throw new Error("No image generated");
  return imageUrl;
};

/**
 * Finds nearby hardware stores using Google Maps Grounding.
 */
export const findHardwareStores = async (latitude: number, longitude: number, toolQuery: string): Promise<StoreLocation[]> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `Find hardware stores nearby that might sell: ${toolQuery}. Return a list of stores with their names and addresses.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude, longitude }
        }
      }
    }
  });

  // Extract grounding chunks for Maps
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const stores: StoreLocation[] = [];

  if (chunks) {
    chunks.forEach(chunk => {
      if (chunk.web?.uri && chunk.web?.title) {
          // Fallback if maps chunk isn't explicit structure, sometimes returns web
           stores.push({
            name: chunk.web.title,
            address: "Check link for details",
            uri: chunk.web.uri
          });
      }
      // Specifically looking for maps chunks if available in the specific response structure
      // The SDK types might vary, but generally we look for metadata
    });
  }
  
  // Parsing text for fallback if grounding works but chunks are obscure
  if (stores.length === 0 && response.text) {
      stores.push({
          name: "Nearby Hardware Store (See map results)",
          address: "Consult map view",
          uri: `https://www.google.com/maps/search/?api=1&query=hardware+store+${encodeURIComponent(toolQuery)}`
      });
  }

  return stores;
};
