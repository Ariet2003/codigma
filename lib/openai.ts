import OpenAI from 'openai';
import { getOpenAIKey } from './settings';

let openaiInstance: OpenAI | null = null;

export async function getOpenAIInstance() {
  if (!openaiInstance) {
    const apiKey = await getOpenAIKey();
    openaiInstance = new OpenAI({
      apiKey,
    });
  }
  return openaiInstance;
}

export async function generateTaskDescription(prompt: string) {
  const openai = await getOpenAIInstance();
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Вы - эксперт по созданию описаний задач для программирования. Создайте четкое и понятное описание задачи на основе предоставленного промпта."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

export async function generateTestCases(functionName: string, description: string) {
  const openai = await getOpenAIInstance();
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Вы - эксперт по созданию тест-кейсов для задач программирования. Создайте набор разнообразных тест-кейсов для проверки корректности решения."
      },
      {
        role: "user",
        content: `Создайте тест-кейсы для функции ${functionName}. Описание задачи: ${description}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

export async function generateHackathonDescription(title: string, theme: string) {
  const openai = await getOpenAIInstance();
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Вы - эксперт по организации хакатонов. Создайте увлекательное и информативное описание хакатона."
      },
      {
        role: "user",
        content: `Создайте описание хакатона "${title}". Тема хакатона: ${theme}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
} 