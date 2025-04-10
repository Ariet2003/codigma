import { prisma } from "./prisma";

export async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.settings.findUnique({
    where: { key },
  });
  return setting?.value ?? null;
}

export async function getOpenAIKey(): Promise<string> {
  const apiKey = await getSetting("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OpenAI API key not found in settings");
  }
  return apiKey;
}

export async function getRapidAPIKey(): Promise<string> {
  const apiKey = await getSetting("RAPIDAPI_KEY");
  if (!apiKey) {
    throw new Error("RapidAPI key not found in settings");
  }
  return apiKey;
} 