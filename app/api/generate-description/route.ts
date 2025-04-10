import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { getOpenAIKey } from '@/lib/settings';

const getOpenAIInstance = async () => {
  const apiKey = await getOpenAIKey();
  return new OpenAI({ apiKey });
};

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    const openai = await getOpenAIInstance();

    const prompt = `Ты эксперт созданием описание хакатона. Прочитав этот текст перепиши описание красивыми словами, с смайликами и т.д. в формате маркдоун. Вот описание который я хочу улучшить:

${content}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Ты эксперт по написанию описаний хакатонов. Используй markdown для форматирования, добавляй эмодзи, создавай структурированный и привлекательный текст." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const improvedDescription = completion.choices[0]?.message?.content;

    if (!improvedDescription) {
      throw new Error("Не удалось сгенерировать описание");
    }

    return NextResponse.json({ content: improvedDescription });
  } catch (error) {
    console.error("Ошибка при генерации описания:", error);
    return NextResponse.json(
      { error: "Ошибка при генерации описания" },
      { status: 500 }
    );
  }
} 