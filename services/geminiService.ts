import { MenuItem } from "../types";
import { apiRequest } from './apiService';

export const geminiService = {
    getMealPlan: async (preferredItemNames: string[], allMenuItems: MenuItem[], budget: number): Promise<string[]> => {
        try {
            // Call our own backend, which will securely call the Gemini API
            const result = await apiRequest('generateMealPlan', { preferredItemNames, allMenuItems, budget });
            
            if (result.success && Array.isArray(result.data)) {
                return result.data;
            }
            
            console.error("Failed to generate meal plan from backend:", result.message);
            return []; // Return empty array on failure
        } catch (error) {
            console.error("Error calling backend for meal plan:", error);
            return [];
        }
    }
};