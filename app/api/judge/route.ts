import { NextResponse } from "next/server";

async function runJudge0Testcases(data: any) {
  const testcases = data.testcases || [];
  const tests_count = testcases.length;
  let correct_tests_count = 0;
  const incorrect_test_indexes: number[] = [];
  const tokens: string[] = [];
  let first_stderr: string | null = null;

  const language_id = data.language_id;
  const source_code = data.source_code;
  // Кодируем исходный код
  const encoded_source_code = Buffer.from(source_code).toString('base64');

  const url = "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false";
  const headers = {
    "content-type": "application/json",
    "x-rapidapi-host": "judge029.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY || ""
  };

  for (let idx = 0; idx < testcases.length; idx++) {

    const testcase = testcases[idx];
    const stdin = testcase.stdin || "";
    const expected_output = String(testcase.expected_output || "");

    const encoded_stdin = Buffer.from(stdin).toString('base64');
    const encoded_expected_output = Buffer.from(expected_output).toString('base64');

    const payload = {
      language_id,
      source_code: encoded_source_code,
      stdin: encoded_stdin,
      expected_output: encoded_expected_output
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

      console.log(`Ответ от Judge0 для кейса ${idx + 1}:`, {
        response
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ошибка Judge0 для кейса ${idx + 1}:`, errorText);
        
        // Улучшенная обработка ошибок
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

      const responseData = await response.json();
      console.log(`Данные от Judge0 для кейса ${idx + 1}:`, responseData);
      const token = responseData.token;

      if (!token) {
        tokens.push("Ошибка");
        incorrect_test_indexes.push(idx);
        if (first_stderr === null) {
          first_stderr = "Правильно";
        }
        continue;
      }

      tokens.push(token);

      // Ждем результата
      let result;
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        const result_url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`;
        const result_response = await fetch(result_url, { headers });

        result = await result_response.json();
        
        console.log(`Проверка результата для кейса ${idx + 1} (попытка ${attempts + 1}):`, {
          status_id: result.status?.id,
          stderr: result.stderr ? Buffer.from(result.stderr, 'base64').toString() : null
        });

        if (result.status.id !== 1 && result.status.id !== 2) {
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }

      if (first_stderr === null && result.stderr) {
        first_stderr = Buffer.from(result.stderr, 'base64').toString();
      }

      if (result.status.id === 3) {
        correct_tests_count++;
      } else {
        incorrect_test_indexes.push(idx);
      }

    } catch (error) {
      console.error("Error:", error);
      tokens.push("Ошибка");
      incorrect_test_indexes.push(idx);
      if (first_stderr === null) {
        first_stderr = "Ошибка выполнения";
      }
    }
  }

  const status = correct_tests_count === tests_count ? 1 : 0;

  return {
    tests_count,
    status,
    stderr: first_stderr || "Правильно",
    tokens,
    correct_tests_count,
    incorrect_test_indexes
  };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("Получены данные:", {
      language_id: data.language_id,
      source_code_length: data.source_code.length,
      testcases_count: data.testcases.length,
      rapidapi_key_length: process.env.RAPIDAPI_KEY?.length || 0
    });

    if (!process.env.RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: "RAPIDAPI_KEY не настроен" },
        { status: 500 }
      );
    }

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