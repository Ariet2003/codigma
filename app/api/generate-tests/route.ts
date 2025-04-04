import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { task_name, metadata, solution_code, test_count } = await request.json();

    const prompt = `
      Ты являешься экспертом в генерации тестовых случаев для задач по программированию.

      Название задачи: ${task_name}

      Метаданные задачи:
      ${JSON.stringify(metadata, null, 4)}

      Исходный код решения:
      ${solution_code}

      Пожалуйста, сгенерируй ${test_count} тестовых случаев для этой задачи.
      Для каждого тестового случая укажи входные данные и ожидаемый результат.
      Верни тесты в формате JSON-массива, где каждый тест — это объект с полями "input" и "expected_output".
      Учитывай разнообразные сценарии, включая крайние случаи.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Ты — эксперт в создании тестовых случаев для задач по программированию."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 700,
    });

    const tests = response.choices[0].message.content;

    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Error generating tests:', error);
    return NextResponse.json(
      { error: 'Failed to generate tests' },
      { status: 500 }
    );
  }
} 