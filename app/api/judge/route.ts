import { NextResponse } from "next/server";
import { getRapidAPIKey } from "@/lib/settings";

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
      console.log(`Тестирование кейса ${idx + 1}:`, {
        stdin_length: stdin.length,
        expected_output_length: expected_output.length
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ошибка Judge0 для кейса ${idx + 1}:`, errorText);
        
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
        console.log(`Проверка результата для кейса ${idx + 1} (попытка ${attempts + 1}):`, {
          status_id: result.status?.id,
          stderr: result.stderr,
          memory: result.memory,
          time: result.time
        });

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

      // Status ID: 3 - Accepted, 4 - Wrong Answer, 5 - Time Limit Exceeded, 6 - Compilation Error
      if (finalResult.status?.id === 3) {
        tokens.push("OK");
        correct_tests_count++;
        // Добавляем память и время выполнения к общей сумме только для успешных тестов
        if (finalResult.memory) {
          total_memory += parseInt(finalResult.memory);
        }
        if (finalResult.time) {
          total_time += parseFloat(finalResult.time) * 1000; // Конвертируем в миллисекунды
        }
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

  // Формируем сообщение о результатах
  let status_message = "";
  if (correct_tests_count === total_tests) {
    status_message = "Правильно";
  } else {
    status_message = `Пройдено тестов: ${correct_tests_count} из ${total_tests}`;
  }

  return {
    tokens,
    incorrect_test_indexes,
    first_stderr: first_stderr || status_message,
    tests_count: total_tests,
    correct_tests_count,
    status: correct_tests_count === total_tests ? 1 : 0,
    total_memory,
    total_time: Math.round(total_time) // Округляем время до целых миллисекунд
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Получены данные:", {
      language_id: data.language_id,
      source_code_length: data.source_code.length,
      testcases_count: data.testcases.length
    });

    const result = await runJudge0Testcases(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ошибка:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
} 