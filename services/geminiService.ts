import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
    getMenuRecommendations: async (preferredItemNames: string[], allItemNames: string[]): Promise<string[]> => {
        
        const prompt = `
You are a sophisticated menu recommendation engine for a premium catering service called GourmetGo. Your goal is to provide personalized suggestions to users based on their past preferences.

Analyze the user's favorite items and past orders provided in the 'User's Preferred Items' list.

Then, from the 'Full Menu' list, recommend up to 4 other distinct items that the user might enjoy. Prioritize items from different categories than what the user usually orders to encourage discovery, but ensure they are complementary. For example, if a user likes Italian main courses, you could suggest a specific Italian appetizer or dessert.

Do not recommend any items that are already in the 'User's Preferred Items' list.

User's Preferred Items:
- ${preferredItemNames.join('\n- ')}

Full Menu:
- ${allItemNames.join('\n- ')}

Return your answer *only* as a JSON array of strings, where each string is the exact name of a recommended menu item. Your response should contain nothing but the JSON array.
Example response: ["Tiramisu", "Bruschetta", "Margherita Pizza"]
        `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        }
                    },
                    temperature: 0.7,
                }
            });

            const resultText = response.text.trim();
            if (!resultText) {
                console.warn("Gemini API returned an empty response for recommendations.");
                return [];
            }
            
            const recommendedNames = JSON.parse(resultText);
            
            if (Array.isArray(recommendedNames)) {
                // Ensure all items are strings
                return recommendedNames.filter(name => typeof name === 'string');
            }
            
            return [];
        } catch (error) {
            console.error("Error fetching recommendations from Gemini API:", error);
            return []; // Return an empty array on error
        }
    }
};
