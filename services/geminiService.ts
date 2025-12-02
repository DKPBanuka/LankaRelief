import { GoogleGenAI } from "@google/genai";
import { Need, Person, Event } from '../types';

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAssistantResponse = async (
  query: string,
  contextData: { needs: Need[]; people: Person[]; events: Event[] }
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    return "I am currently offline (API Key missing). Please check back later.";
  }

  const ai = new GoogleGenAI({ apiKey });

  const contextSummary = `
    Current Situation Summary:
    Needs: ${contextData.needs.length} active requests. Top urgency: ${contextData.needs.slice(0, 3).map(n => `${n.quantity} ${n.item} in ${n.district}`).join(', ')}.
    Missing/Safe People: ${contextData.people.length} reports.
    Volunteer Events: ${contextData.events.length} active events.
  `;

  const prompt = `
    You are the AI Assistant for "Lanka Relief", a disaster management platform in Sri Lanka.
    Your goal is to help users find information about donations, missing people, and volunteer opportunities based on the provided data.
    
    Context Data:
    ${contextSummary}

    User Query: ${query}

    Instructions:
    1. Be helpful, empathetic, and concise.
    2. Answer in the same language as the user query (English or Sinhala).
    3. If the user asks about specific needs, summarize the 'Needs' data.
    4. If the user asks about safety, refer to the 'People' data.
    5. If you don't have the info, advise them to check the specific section of the website.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "I'm having trouble connecting to the network right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Please try again.";
  }
};

export const refineNeedDescription = async (
  item: string,
  location: string,
  userNotes: string
): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return userNotes;

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    A user is posting a disaster relief request on "Lanka Relief".
    Item: ${item}
    Location: ${location}
    User Notes: ${userNotes}

    Task: Rewrite the User Notes to be clear, urgent, and empathetic so donors understand the situation easily.
    Output Format: Provide the result in two paragraphs.
    1. First paragraph in Sinhala.
    2. Second paragraph in English.
    Keep it concise (max 50 words per language).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || userNotes;
  } catch (error) {
    return userNotes;
  }
};