// This file runs on the server as part of a Vercel Serverless Function.
// It is not part of the client-side bundle.

import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

// This initialization is secure because it only happens on the server.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMealPlanFromServer = async (preferredItemNames: string[], allMenuItems: MenuItem[], budget: number): Promise<string[]> => {
    
    const menuWithPrices = allMenuItems.map(item => `- ${item.name}: PKR ${item.price.toFixed(2)}`).join('\n');
    
    const prompt = `
You are a sophisticated meal planning assistant for a premium catering service called GourmetGo. Your goal is to create a personalized, budget-conscious meal plan for a user.

Analyze the user's favorite items and past orders provided in the 'User's Preferred Items' list to understand their taste profile.

Your main task is to create an optimized and balanced meal plan from the 'Full Menu'. A balanced meal plan should ideally include a variety of courses (e.g., an appetizer, a main course, a dessert, and a beverage), but you have flexibility.

The total cost of all items in your recommended plan MUST NOT exceed the user's budget of PKR ${budget.toFixed(2)}. Try to get as close to the budget as possible to provide the best value without going over.

Do not recommend any items that are already in the 'User's Preferred Items' list, unless it's necessary to meet the budget and preferences.

User's Preferred Items:
- ${preferredItemNames.join('\n- ')}

Full Menu (with prices):
${menuWithPrices}

User's Budget: PKR ${budget.toFixed(2)}

Return your answer *only* as a JSON array of strings, where each string is the exact name of a recommended menu item from the "Full Menu". The response should contain nothing but the JSON array. The order of items in the array matters, try to order them by course (appetizer, main, etc.).
Example response: ["Bruschetta", "Spaghetti Carbonara", "Tiramisu", "Espresso"]
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
                temperature: 0.5,
            }
        });

        const resultText = response.text.trim();
        if (!resultText) {
            console.warn("Gemini API returned an empty response for meal plan.");
            return [];
        }
        
        const recommendedNames = JSON.parse(resultText);
        
        if (Array.isArray(recommendedNames)) {
            return recommendedNames.filter(name => typeof name === 'string');
        }
        
        return [];
    } catch (error) {
        console.error("Error fetching meal plan from Gemini API:", error);
        throw new Error('Failed to communicate with Gemini API.');
    }
};