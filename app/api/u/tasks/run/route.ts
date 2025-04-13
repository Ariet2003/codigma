import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getRapidAPIKey } from "@/lib/settings";
import { Status } from "@prisma/client";

const judge0_language_ids = {
  cpp: 54,
  js: 63,
  rust: 73,
  java: 62
};

async function runJudge0Testcases(data: any) {
  const rapidApiKey = await getRapidAPIKey();
  const testcases = data.testcases || [];
  const tokens: string[] = [];
  const incorrect_test_indexes: number[] = [];
  let first_stderr: string | null = null;
  let correct_tests_count = 0;
  const total_tests = testcases.length;
  let total_memory = 0;
  let total_time = 0;

  const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false';
  const headers = {
    'content-type': 'application/json',
    'X-RapidAPI-Key': rapidApiKey,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
  };

  for (let idx = 0; idx < testcases.length; idx++) {
    const testcase = testcases[idx];
    const { stdin, expected_output } = testcase;

    const payload = {
      language_id: data.language_id,
      source_code: data.source_code,
      stdin: stdin,
      expected_output: expected_output,
      cpu_time_limit: 5,
      memory_limit: 128000,
      enable_network: false
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Ошибка Judge0";
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message === "You are not subscribed to this API.") {
            errorMessage = "Требуется подписка на API Judge0. Пожалуйста, подпишитесь на сервис в RapidAPI.";
          } else if (errorJson.message === "Too many requests") {
            errorMessage = "Слишком много запросов. Пожалуйста, подождите немного и попробуйте снова.";
          } else {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          errorMessage = errorText;
        }
        
        tokens.push("Ошибка");
        incorrect_test_indexes.push(idx);
        if (first_stderr === null) {
          first_stderr = errorMessage;
        }
        continue;
      }

      const submissionData = await response.json();
      const token = submissionData.token;

      if (!token) {
        tokens.push("Ошибка");
        incorrect_test_indexes.push(idx);
        if (first_stderr === null) {
          first_stderr = "Не удалось получить токен";
        }
        continue;
      }

      console.log(`Тест ${idx + 1}: ${token}`);

      // Ждем результата выполнения
      let attempts = 0;
      const maxAttempts = 10;
      let finalResult = null;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const checkUrl = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`;
        const checkResponse = await fetch(checkUrl, { headers });
        
        if (!checkResponse.ok) {
          console.error(`Ошибка при проверке результата для кейса ${idx + 1}`);
          break;
        }

        const result = await checkResponse.json();

        // Status ID: 1 - In Queue, 2 - Processing
        if (result.status?.id !== 1 && result.status?.id !== 2) {
          finalResult = result;
          break;
        }

        attempts++;
      }

      if (!finalResult) {
        tokens.push("Таймаут");
        incorrect_test_indexes.push(idx);
        if (first_stderr === null) {
          first_stderr = "Превышено время ожидания результата";
        }
        continue;
      }

      // Добавляем память и время выполнения к общей сумме
      if (finalResult.memory) {
        total_memory += parseInt(finalResult.memory);
      }
      if (finalResult.time) {
        total_time += parseFloat(finalResult.time) * 1000; // Конвертируем в миллисекунды
      }

      // Status ID: 3 - Accepted, 4 - Wrong Answer, 5 - Time Limit Exceeded, 6 - Compilation Error
      if (finalResult.status?.id === 3) {
        tokens.push("OK");
        correct_tests_count++;
      } else {
        tokens.push(finalResult.status?.description || "Ошибка");
        incorrect_test_indexes.push(idx);
        if (first_stderr === null) {
          first_stderr = finalResult.compile_output || finalResult.stderr || "Неизвестная ошибка";
        }
      }

    } catch (error) {
      console.error(`Ошибка при выполнении кейса ${idx + 1}:`, error);
      tokens.push("Ошибка");
      incorrect_test_indexes.push(idx);
      if (first_stderr === null) {
        first_stderr = error instanceof Error ? error.message : "Неизвестная ошибка";
      }
    }
  }

  // Определяем статус выполнения
  let status: Status = Status.REJECTED;
  if (correct_tests_count === total_tests) {
    status = Status.ACCEPTED;
  } else if (first_stderr?.includes("Time Limit Exceeded") || first_stderr?.includes("Compilation Error")) {
    status = Status.ERROR;
  }

  // Формируем сообщение о результатах
  let status_message = "";
  if (correct_tests_count === total_tests) {
    status_message = "Все тесты пройдены успешно";
  } else {
    status_message = `Пройдено тестов: ${correct_tests_count} из ${total_tests}`;
  }

  return {
    tokens,
    incorrect_test_indexes,
    first_stderr: first_stderr || status_message,
    tests_count: total_tests,
    correct_tests_count,
    status,
    total_memory,
    total_time: Number(Math.round(total_time)), // Конвертируем в обычное число вместо BigInt
    status_message
  };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { taskId, language, code } = data;

    // Получаем задачу с полным шаблоном
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        testCases: true,
        codeTemplates: {
          where: { language },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Задача не найдена" },
        { status: 404 }
      );
    }

    const template = task.codeTemplates[0];
    if (!template) {
      return NextResponse.json(
        { error: "Шаблон для выбранного языка не найден" },
        { status: 404 }
      );
    }

    // Подставляем код пользователя в полный шаблон
    const sourceCode = template.fullTemplate.replace("##USER_CODE_HERE##", code);

    const result = await runJudge0Testcases({
      language_id: judge0_language_ids[language as keyof typeof judge0_language_ids],
      source_code: sourceCode,
      testcases: task.testCases.map(tc => ({
        stdin: tc.input,
        expected_output: tc.expectedOutput
      }))
    });

    // Сохраняем результаты в БД
    await prisma.userTaskSubmission.create({
      data: {
        userId: session.user.id,
        taskId: taskId,
        code: code,
        language: language,
        memory: result.total_memory,
        executionTime: BigInt(result.total_time), // Конвертируем в BigInt для БД
        testsPassed: result.correct_tests_count,
        testsTotal: result.tests_count,
        status: result.status,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 