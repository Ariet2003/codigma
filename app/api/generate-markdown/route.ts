import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getOpenAIKey } from '@/lib/settings';

const getOpenAIInstance = async () => {
  const apiKey = await getOpenAIKey();
  return new OpenAI({ apiKey });
};

const systemPrompt = `Ты помощник по программированию. Твоя задача - создавать условия задач в стиле LeetCode. 
Формат вывода должен быть строго следующим:

## Название задачи

### Условие
Описание задачи по заданной теме.

### Пример 1:
**Вход:**  
\`Описание входных данных\`

**Выход:**  
\`Ожидаемый результат\`

(При необходимости несколько примеров)
Если будут важные данные (например, переменные или значения), используй \`\``;

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    const openai = await getOpenAIInstance();

    if (!prompt) {
      return NextResponse.json(
        { error: "Отсутствует текст для генерации" },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    });

    const markdown = response.choices[0].message.content;

    return NextResponse.json({ markdown });
  } catch (error) {
    console.error("Ошибка при генерации markdown:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации markdown" },
      { status: 500 }
    );
  }
} 