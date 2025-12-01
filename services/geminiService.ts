import { GoogleGenAI, Type } from "@google/genai";
import { Meal, UserProfile, DailyPlan } from '../types';
import { MEALS } from '../constants';
import { dataService } from './dataService';

export const generateWeeklyPlan = async (user: UserProfile): Promise<DailyPlan[]> => {
  // Now async
  const currentMeals = await dataService.getMeals();
  const mealList = currentMeals.map(m => `${m.id}: ${m.name} (${m.macros.calories}kcal)`).join(', ');

  const prompt = `
    You are an expert nutritionist for 'Uncle Healthy'.
    User Profile:
    - Age: ${user.age}
    - Gender: ${user.gender}
    - Height: ${user.height}
    - Weight: ${user.weight}
    - Goal: ${user.goal}
    - Allergies: ${user.allergies}

    Available Meals ID List: ${mealList}

    Task: Create a 7-day meal plan (Day 1 to Day 7) selecting strictly from the available meals provided above.
    The plan must align with the user's goal.
    Return ONLY a JSON array.
    
    Structure:
    [
      {
        "day": "Day 1",
        "breakfastId": "m4",
        "lunchId": "m1",
        "dinnerId": "m2"
      },
      ...
    ]
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              breakfastId: { type: Type.STRING },
              lunchId: { type: Type.STRING },
              dinnerId: { type: Type.STRING },
            }
          }
        }
      }
    });

    const rawData = JSON.parse(response.text || '[]');
    
    // Map IDs back to full meal objects
    const finalPlan: DailyPlan[] = rawData.map((day: any) => ({
      day: day.day,
      breakfast: currentMeals.find(m => m.id === day.breakfastId) || currentMeals[0],
      lunch: currentMeals.find(m => m.id === day.lunchId) || currentMeals[1],
      dinner: currentMeals.find(m => m.id === day.dinnerId) || currentMeals[2],
    }));

    return finalPlan;

  } catch (error) {
    console.error("Error generating plan:", error);
    // Return a default plan in case of error
    return Array.from({ length: 7 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      breakfast: MEALS[3],
      lunch: MEALS[0],
      dinner: MEALS[1]
    }));
  }
};

export const chatWithNutritionist = async (history: {role: string, text: string}[], newMessage: string) => {
    // Now async
    const currentMeals = await dataService.getMeals();
    const menuContext = currentMeals.map(m => `- ${m.name}: ${m.description} (${m.macros.calories} Cal, ${m.macros.protein}g Protein). Price: ${m.price}`).join('\n');

    const systemInstruction = `
      You are the official AI Assistant for "Uncle Healthy" website.
      You speak Arabic. You are friendly, helpful, and knowledgeable about nutrition.
      
      Here is the current menu available on the website:
      ${menuContext}

      Your tasks:
      1. Answer questions about the meals (calories, ingredients, price).
      2. Give general health advice based on the user's questions.
      3. Recommend meals from the menu based on user goals (e.g. high protein, low carb).
      
      Keep answers concise and helpful.
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { systemInstruction }
      });
      
      const response = await chat.sendMessage({ message: newMessage });
      return response.text;
    } catch (error) {
      console.error(error);
      return "عذراً، أواجه مشكلة في الاتصال بالخادم حالياً. يرجى التأكد من مفتاح API أو المحاولة لاحقاً.";
    }
};