"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  BarChart, 
  PenLine, 
  Eye, 
  Wand2,
  Loader2,
  X,
  Beaker,
  Sparkles,
  Save,
  ChevronLeft,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { cpp } from '@codemirror/lang-cpp';
import { rust } from '@codemirror/lang-rust';
import { java } from '@codemirror/lang-java';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { basicLight } from '@uiw/codemirror-theme-basic';

type TestResult = {
  tests_count: number;
  status: number;
  stderr: string;
  tokens: string[];
  correct_tests_count: number;
  incorrect_test_indexes: number[];
};

const judge0_language_ids = {
  cpp: 54,
  js: 63,
  rust: 73,
  java: 62
};

type TestCase = {
  input: string;
  expected_output: string | number | boolean;
  isCorrect?: boolean;
};

type Parameter = {
  id: string;
  name: string;
  type: string;
};

type CodeTemplates = {
  cppTemplate: string;
  jsTemplate: string;
  rustTemplate: string;
  javaTemplate: string;
  fullCpp: string;
  fullJs: string;
  fullRust: string;
  fullJava: string;
};

const STORAGE_KEYS = {
  title: 'edit_task_title',
  difficulty: 'edit_task_difficulty',
  description: 'edit_task_description',
  showMarkdown: 'edit_task_show_markdown',
  testCases: 'edit_task_test_cases',
  testResults: 'edit_task_test_results'
};

export default function EditTask() {
  const params = useParams();
  const taskId = params.id as string;
  const router = useRouter();
  const { theme } = useTheme();

  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [isTestingCases, setIsTestingCases] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Данные только для просмотра
  const [functionName, setFunctionName] = useState("");
  const [inputParams, setInputParams] = useState<Parameter[]>([]);
  const [outputParams, setOutputParams] = useState<Parameter[]>([]);
  const [codeTemplates, setCodeTemplates] = useState<CodeTemplates | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("cpp");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult | null>(null);
  const [testCount, setTestCount] = useState<number>(10);
  const [testLanguage, setTestLanguage] = useState<string>("cpp");
  const [testCode, setTestCode] = useState<string>("");
  const [isTestsModified, setIsTestsModified] = useState(false);
  const [areAllTestsPassing, setAreAllTestsPassing] = useState(false);

  // Загрузка данных задачи
  useEffect(() => {
    const loadTask = async () => {
      try {
        // Сначала очищаем предыдущие данные
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });

        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) {
          throw new Error("Ошибка при загрузке задачи");
        }
        const task = await response.json();
        
        // Преобразуем параметры и добавляем id
        const inputParamsWithIds = task.inputParams.map((param: any) => ({
          id: crypto.randomUUID(),
          name: param.name,
          type: param.type
        }));

        const outputParamsWithIds = task.outputParams.map((param: any) => ({
          id: crypto.randomUUID(),
          name: param.name,
          type: param.type
        }));

        // Создаем объект шаблонов кода из полученных данных
        const templates = {
          cppTemplate: task.codeTemplates.find((t: any) => t.language === 'cpp')?.baseTemplate || '',
          jsTemplate: task.codeTemplates.find((t: any) => t.language === 'js')?.baseTemplate || '',
          rustTemplate: task.codeTemplates.find((t: any) => t.language === 'rust')?.baseTemplate || '',
          javaTemplate: task.codeTemplates.find((t: any) => t.language === 'java')?.baseTemplate || '',
          fullCpp: task.codeTemplates.find((t: any) => t.language === 'cpp')?.fullTemplate || '',
          fullJs: task.codeTemplates.find((t: any) => t.language === 'js')?.fullTemplate || '',
          fullRust: task.codeTemplates.find((t: any) => t.language === 'rust')?.fullTemplate || '',
          fullJava: task.codeTemplates.find((t: any) => t.language === 'java')?.fullTemplate || ''
        };

        // Преобразуем тесткейсы
        const formattedTestCases = task.testCases.map((test: any) => ({
          input: test.input,
          expected_output: test.expectedOutput,
          isCorrect: undefined
        }));

        // Сохраняем данные в localStorage
        localStorage.setItem(STORAGE_KEYS.title, task.title);
        localStorage.setItem(STORAGE_KEYS.difficulty, task.difficulty);
        localStorage.setItem(STORAGE_KEYS.description, task.description);
        localStorage.setItem(STORAGE_KEYS.testCases, JSON.stringify(formattedTestCases));
        
        // Устанавливаем состояния
        setTitle(task.title);
        setDifficulty(task.difficulty);
        setDescription(task.description);
        setFunctionName(task.functionName);
        setInputParams(inputParamsWithIds);
        setOutputParams(outputParamsWithIds);
        setCodeTemplates(templates);
        setTestCases(formattedTestCases);
        setSelectedLanguage('cpp');
        setTestLanguage('cpp');
        setTestCount(10);
        
        // Устанавливаем начальный код для тестов
        const initialTestCode = templates.cppTemplate;
        setTestCode(initialTestCode);

        setIsInitialized(true);
      } catch (error) {
        console.error("Ошибка при загрузке задачи:", error);
      } finally {
        setIsLoadingTask(false);
      }
    };

    if (taskId) {
      loadTask();
    }

    // Очистка localStorage при размонтировании компонента
    return () => {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    };
  }, [taskId]);

  // Загрузка данных из localStorage при обновлении страницы
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
      const savedDifficulty = localStorage.getItem(STORAGE_KEYS.difficulty);
      const savedDescription = localStorage.getItem(STORAGE_KEYS.description);
      const savedShowMarkdown = localStorage.getItem(STORAGE_KEYS.showMarkdown);
      const savedTestCases = localStorage.getItem(STORAGE_KEYS.testCases);
      const savedTestResults = localStorage.getItem(STORAGE_KEYS.testResults);

      // Проверяем наличие данных в localStorage перед установкой состояний
      if (savedTitle && savedDifficulty && savedDescription) {
        setTitle(savedTitle);
        setDifficulty(savedDifficulty);
        setDescription(savedDescription);
        if (savedShowMarkdown) setShowMarkdown(savedShowMarkdown === 'true');
        if (savedTestCases) setTestCases(JSON.parse(savedTestCases));
        if (savedTestResults) setTestResults(JSON.parse(savedTestResults));
      }
    }
  }, [isInitialized]);

  // Сохраняем изменения в localStorage при изменении состояний
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem(STORAGE_KEYS.title, title);
      localStorage.setItem(STORAGE_KEYS.difficulty, difficulty);
      localStorage.setItem(STORAGE_KEYS.description, description);
      localStorage.setItem(STORAGE_KEYS.showMarkdown, showMarkdown.toString());
      localStorage.setItem(STORAGE_KEYS.testCases, JSON.stringify(testCases));
      if (testResults) {
        localStorage.setItem(STORAGE_KEYS.testResults, JSON.stringify(testResults));
      }
    }
  }, [title, difficulty, description, showMarkdown, testCases, isInitialized, testResults]);

  const generateMarkdown = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate-markdown", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: description }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при генерации markdown");
      }

      const data = await response.json();
      setDescription(data.markdown);
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "cpp": return "C++";
      case "js": return "JavaScript";
      case "rust": return "Rust";
      case "java": return "Java";
      default: return lang;
    }
  };

  const getTemplateForLanguage = (lang: string) => {
    if (!codeTemplates) return "";
    switch (lang) {
      case "cpp": return codeTemplates.cppTemplate;
      case "js": return codeTemplates.jsTemplate;
      case "rust": return codeTemplates.rustTemplate;
      case "java": return codeTemplates.javaTemplate;
      default: return "";
    }
  };

  const getFullTemplateForLanguage = (lang: string) => {
    if (!codeTemplates) return "";
    switch (lang) {
      case "cpp": return codeTemplates.fullCpp;
      case "js": return codeTemplates.fullJs;
      case "rust": return codeTemplates.fullRust;
      case "java": return codeTemplates.fullJava;
      default: return "";
    }
  };

  const extractJson = (testsStr: string): string => {
    // Попытка извлечь блок, обрамлённый ```json ... ```
    const match = testsStr.match(/```json\s*(\[[\s\S]*\])\s*```/);
    if (match) {
      return match[1];
    }

    // Если блок с ```json не найден, пытаемся извлечь содержимое от первой '[' до последней ']'
    const start = testsStr.indexOf('[');
    const end = testsStr.lastIndexOf(']');
    if (start !== -1 && end !== -1 && start < end) {
      return testsStr.slice(start, end + 1);
    }

    throw new Error("No valid JSON found in the input string.");
  };

  const parseTests = (testsStr: string): TestCase[] => {
    const jsonStr = extractJson(testsStr);
    const tests = JSON.parse(jsonStr);
    const formattedTests: TestCase[] = [];

    for (const test of tests) {
      const inputData = test.input || {};
      const lines: string[] = [];

      // Форматируем поле "input"
      Object.entries(inputData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          lines.push(String(value.length)); // Первая строка: количество элементов
          lines.push(value.map(String).join(' ')); // Вторая строка: элементы через пробел
        } else {
          lines.push(String(value));
        }
      });

      let formattedInput = lines.join('\n');

      // Обрабатываем поле "expected_output"
      let expectedOutput = test.expected_output;
      if (typeof expectedOutput === 'object' && expectedOutput !== null) {
        expectedOutput = Object.values(expectedOutput)[0];
      }
      if (typeof expectedOutput === 'boolean') {
        expectedOutput = String(expectedOutput).toLowerCase();
      }

      formattedTests.push({
        input: formattedInput,
        expected_output: expectedOutput
      });
    }

    return formattedTests;
  };

  const generateTests = async () => {
    setIsGeneratingTests(true);
    // Сбрасываем результаты тестов при генерации новых
    setTestResults(null);
    try {
      const metadata = {
        task_name: title,
        difficulty: difficulty,
        description: description,
        function_name: functionName,
        inputs: inputParams.map(({ name, type }) => ({ name, type })),
        outputs: outputParams.map(({ name, type }) => ({ name, type }))
      };

      const response = await fetch("/api/generate-tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_name: title,
          metadata: metadata,
          solution_code: testCode,
          test_count: testCount
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при генерации тестов");
      }

      const data = await response.json();
      const parsedTests = parseTests(data.tests);
      // При генерации новых тестов сбрасываем их статус
      setTestCases(parsedTests.map(test => ({ ...test, isCorrect: undefined })));
    } catch (error) {
      console.error("Ошибка:", error);
    } finally {
      setIsGeneratingTests(false);
    }
  };

  const getLanguageExtension = (lang: string) => {
    switch (lang) {
      case "js": return javascript();
      case "cpp": return cpp();
      case "rust": return rust();
      case "java": return java();
      default: return cpp();
    }
  };

  // Обновляем обработчик изменения тесткейсов
  const handleTestCaseChange = (index: number, field: 'input' | 'expected_output', value: string) => {
    const newTestCases = [...testCases];
    newTestCases[index] = {
      ...newTestCases[index],
      [field]: value.trim(),  // Добавляем trim() при сохранении значения
      isCorrect: undefined
    };
    setTestCases(newTestCases);
    setIsTestsModified(true);
    setAreAllTestsPassing(false);
    setTestResults(null);  // Сбрасываем результаты предыдущего тестирования
  };

  // Обновляем функцию runTestCases
  const runTestCases = async () => {
    setIsTestingCases(true);
    try {
      const fullTemplate = getFullTemplateForLanguage(testLanguage);
      const sourceCode = fullTemplate.replace("##USER_CODE_HERE##", testCode);

      const data = {
        language_id: judge0_language_ids[testLanguage as keyof typeof judge0_language_ids],
        source_code: sourceCode,
        testcases: testCases.map(tc => ({
          stdin: tc.input,
          expected_output: String(tc.expected_output).trim()  // Добавляем trim() для удаления лишних пробелов
        }))
      };

      console.log("Отправляемые тесты:", data.testcases);

      const response = await fetch("/api/judge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Ошибка при тестировании");
      }

      await new Promise(resolve => setTimeout(resolve, 3000));

      const result: TestResult = await response.json();
      console.log("Результаты тестирования:", result);

      // Обновляем состояние тесткейсов с результатами
      const updatedTestCases = testCases.map((tc, idx) => ({
        ...tc,
        isCorrect: !result.incorrect_test_indexes.includes(idx)
      }));
      setTestCases(updatedTestCases);
      
      // Проверяем, все ли тесты прошли успешно
      const allTestsPassing = result.incorrect_test_indexes.length === 0;
      setAreAllTestsPassing(allTestsPassing);
      setTestResults(result);

      // Если все тесты пройдены, сбрасываем флаг модификации
      if (allTestsPassing) {
        setIsTestsModified(false);
      }

    } catch (error) {
      console.error("Ошибка:", error);
      setAreAllTestsPassing(false);
    } finally {
      setIsTestingCases(false);
    }
  };

  // Добавляем обработчик изменения языка тестов
  const handleTestLanguageChange = (newLanguage: string) => {
    setTestLanguage(newLanguage);
    // Обновляем код в редакторе на базовый шаблон выбранного языка
    const newTemplate = getTemplateForLanguage(newLanguage);
    setTestCode(newTemplate);
  };

  const handleSaveTask = async () => {
    try {
      const taskData = {
        title,
        difficulty,
        description,
        function_name: functionName,
        input_params: inputParams,
        output_params: outputParams,
        templates: {
          cpp: {
            base: codeTemplates?.cppTemplate || "",
            full: codeTemplates?.fullCpp || ""
          },
          js: {
            base: codeTemplates?.jsTemplate || "",
            full: codeTemplates?.fullJs || ""
          },
          rust: {
            base: codeTemplates?.rustTemplate || "",
            full: codeTemplates?.fullRust || ""
          },
          java: {
            base: codeTemplates?.javaTemplate || "",
            full: codeTemplates?.fullJava || ""
          }
        },
        test_cases: testCases
      };

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Ошибка при обновлении задачи");
      }

      setSaveResult({
        success: true,
        message: "Задача успешно обновлена!"
      });
      setShowResult(true);
    } catch (error) {
      console.error("Ошибка при обновлении задачи:", error);
      setSaveResult({
        success: false,
        message: error instanceof Error ? error.message : "Произошла ошибка при обновлении задачи"
      });
      setShowResult(true);
    }
  };

  const handleResultClose = () => {
    setShowResult(false);
  };

  const clearLocalStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  const handleBackClick = () => {
    clearLocalStorage();
    router.push('/admin/tasks');
  };

  if (isLoadingTask) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4E7AFF]" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackClick}
              className="hover:bg-transparent"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-[#4E7AFF]" />
            </div>
            <h1 className="text-2xl font-bold text-[#4E7AFF]">
              Редактировать задачу
            </h1>
          </div>
          <Button
            onClick={handleSaveTask}
            disabled={isTestsModified && !areAllTestsPassing}
            className="px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Сохранить изменения
          </Button>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                  <PenLine className="w-4 h-4 text-[#4E7AFF]" />
                </div>
                <Label htmlFor="title" className="font-medium text-foreground">
                  Название задачи
                </Label>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название задачи"
                className="border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
              />
            </div>

            <div className="w-full md:w-48 space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                  <BarChart className="w-4 h-4 text-[#4E7AFF]" />
                </div>
                <Label htmlFor="difficulty" className="font-medium text-foreground">
                  Сложность
                </Label>
              </div>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger 
                  id="difficulty" 
                  className="border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
                >
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy" className="text-green-500">Легкий</SelectItem>
                  <SelectItem value="medium" className="text-yellow-500">Средний</SelectItem>
                  <SelectItem value="hard" className="text-red-500">Сложный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                  <PenLine className="w-4 h-4 text-[#4E7AFF]" />
                </div>
                <Label htmlFor="description" className="font-medium text-foreground">
                  Описание задачи
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-[#4E7AFF]" />
                <Switch
                  id="markdown-preview"
                  checked={showMarkdown}
                  onCheckedChange={setShowMarkdown}
                />
              </div>
            </div>

            <div className="relative">
              {!showMarkdown ? (
                <div className="border border-color-[hsl(var(--border))] rounded-lg">
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Введите описание задачи"
                    className="min-h-[200px] font-mono text-sm border-none resize-y focus-visible:ring-0 bg-transparent text-foreground"
                  />
                </div>
              ) : (
                <div className="border border-color-[hsl(var(--border))] rounded-lg bg-transparent p-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {description || "*Нет описания...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              onClick={generateMarkdown} 
              disabled={!description || isLoading}
              className="px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 text-center flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {isLoading ? "Генерация..." : "Генерировать Markdown"}
            </Button>
          </div>

          <div className="border-t border-color-[hsl(var(--border))] mt-6 pt-6">
            <div className="flex items-center gap-2">
              <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-[#4E7AFF]" />
              </div>
              <h2 className="text-xl font-bold text-[#4E7AFF]">
                Информация о задаче
              </h2>
            </div>

            <div className="space-y-6 mt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                    <PenLine className="w-4 h-4 text-[#4E7AFF]" />
                  </div>
                  <Label htmlFor="functionName" className="font-medium text-foreground">
                    Название функции
                  </Label>
                </div>
                <div className="h-10 flex items-center px-3 border border-color-[hsl(var(--border))] rounded-md bg-transparent text-foreground">
                  {functionName}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Структура входных данных</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Входные переменные */}
                  <div className="space-y-2 rounded-lg border border-color-[hsl(var(--border))] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Входные параметры</span>
                    </div>
                    
                    <div className="space-y-3">
                      {inputParams.map((param) => (
                        <div key={param.id} className="flex gap-4 items-center">
                          <div className="flex-1 h-10 flex items-center px-3 border border-color-[hsl(var(--border))] rounded-md bg-transparent text-foreground">
                            {param.name}
                          </div>
                          <div className="w-[180px] h-10 flex items-center px-3 border border-color-[hsl(var(--border))] rounded-md bg-transparent text-foreground">
                            {param.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Выходные переменные */}
                  <div className="space-y-2 rounded-lg border border-color-[hsl(var(--border))] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Выходные параметры</span>
                    </div>
                    
                    <div className="space-y-3">
                      {outputParams.map((param) => (
                        <div key={param.id} className="flex gap-4 items-center">
                          <div className="flex-1 h-10 flex items-center px-3 border border-color-[hsl(var(--border))] rounded-md bg-transparent text-foreground">
                            {param.name}
                          </div>
                          <div className="w-[180px] h-10 flex items-center px-3 border border-color-[hsl(var(--border))] rounded-md bg-transparent text-foreground">
                            {param.type}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {codeTemplates && (
            <>
              <div className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#4E7AFF]">Шаблонные коды</h3>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-[180px] border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30">
                      <SelectValue placeholder="Выберите язык" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="js">JavaScript</SelectItem>
                      <SelectItem value="rust">Rust</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-medium text-foreground">Базовый шаблон</Label>
                    <div className="rounded-lg border border-color-[hsl(var(--border))] overflow-hidden">
                      <SyntaxHighlighter
                        language={selectedLanguage === "js" ? "javascript" : selectedLanguage}
                        style={theme === 'dark' ? nightOwl : oneLight}
                        customStyle={{ margin: 0, borderRadius: 0 }}
                      >
                        {getTemplateForLanguage(selectedLanguage)}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-medium text-foreground">Полный шаблон</Label>
                    <div className="rounded-lg border border-color-[hsl(var(--border))] overflow-hidden">
                      <SyntaxHighlighter
                        language={selectedLanguage === "js" ? "javascript" : selectedLanguage}
                        style={theme === 'dark' ? nightOwl : oneLight}
                        customStyle={{ margin: 0, borderRadius: 0 }}
                      >
                        {getFullTemplateForLanguage(selectedLanguage)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-color-[hsl(var(--border))] mt-6 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                      <Beaker className="w-6 h-6 text-[#4E7AFF]" />
                    </div>
                    <h2 className="text-xl font-bold text-[#4E7AFF]">
                      Тесты для задачки
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6">
                  <div className="space-y-4">
                    <div className="rounded-lg border border-color-[hsl(var(--border))] overflow-hidden">
                      <CodeMirror
                        value={testCode}
                        height="auto"
                        minHeight="250px"
                        maxHeight="600px"
                        theme={theme === 'dark' ? vscodeDark : basicLight}
                        onChange={(value) => {
                          setTestCode(value);
                        }}
                        extensions={[getLanguageExtension(testLanguage)]}
                        className={`${theme === 'light' ? 'text-[15px]' : 'text-[15px]'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-[#4E7AFF] mb-4">Parameters</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="font-medium text-foreground">
                            Языковой режим для тестов
                          </Label>
                          <Select value={testLanguage} onValueChange={handleTestLanguageChange}>
                            <SelectTrigger className="w-full border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30">
                              <SelectValue placeholder="Выберите язык" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cpp">C++</SelectItem>
                              <SelectItem value="js">JavaScript</SelectItem>
                              <SelectItem value="rust">Rust</SelectItem>
                              <SelectItem value="java">Java</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium text-foreground">
                            Количество тестов
                          </Label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="1"
                              max="20"
                              value={testCount}
                              onChange={(e) => setTestCount(Number(e.target.value))}
                              className="flex-1 h-2 bg-[#4E7AFF]/20 rounded-lg appearance-none cursor-pointer accent-[#4E7AFF]"
                            />
                            <span className="text-foreground font-medium min-w-[2rem] text-center">
                              {testCount}
                            </span>
                          </div>
                        </div>

                        <Button 
                          className="w-full px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 text-center flex items-center justify-center gap-2"
                          onClick={generateTests}
                          disabled={isGeneratingTests}
                        >
                          {isGeneratingTests ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          {isGeneratingTests ? "Генерация..." : "Тесткейсы"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {testCases.length > 0 && (
                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#4E7AFF]">Сгенерированные тесткейсы</h3>
                    <Button
                      variant="outline"
                      onClick={() => setTestCases([])}
                      className="px-4 py-2 rounded-lg border border-[#4E7AFF] text-[#4E7AFF] dark:text-white font-medium transition-all hover:bg-[#4E7AFF]/10 hover:scale-105 text-center flex items-center gap-2"
                    >
                      Очистить тесты
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {testCases.map((testCase, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="h-8 flex items-center">
                            <Label className="font-medium text-foreground">
                              Входные данные {index + 1}
                            </Label>
                          </div>
                          <div className={`rounded-lg border overflow-hidden ${
                            testResults && testCase.isCorrect !== undefined ? 
                              (testCase.isCorrect ? "border-green-500" : "border-red-500") : 
                              "border-color-[hsl(var(--border))]"
                          }`}>
                            <Textarea
                              value={testCase.input}
                              onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                              className="min-h-[100px] font-mono text-sm border-none resize-y focus-visible:ring-0 bg-transparent text-foreground"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="h-8 flex items-center justify-between gap-2">
                            <Label className="font-medium text-foreground">
                              Ожидаемый вывод {index + 1}
                            </Label>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-[#4E7AFF] hover:text-red-500 transition-all shrink-0"
                              onClick={() => {
                                const newTestCases = [...testCases];
                                newTestCases.splice(index, 1);
                                setTestCases(newTestCases);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className={`rounded-lg border overflow-hidden ${
                            testResults && testCase.isCorrect !== undefined ? 
                              (testCase.isCorrect ? "border-green-500" : "border-red-500") : 
                              "border-color-[hsl(var(--border))]"
                          }`}>
                            <Textarea
                              value={String(testCase.expected_output)}
                              onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                              className="min-h-[100px] font-mono text-sm border-none resize-y focus-visible:ring-0 bg-transparent text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => {
                          setTestCases([
                            ...testCases,
                            { input: "", expected_output: "", isCorrect: undefined }
                          ]);
                        }}
                        variant="outline"
                        className="px-6 py-3 rounded-lg border border-[#4E7AFF] text-[#4E7AFF] dark:text-white font-medium transition-all hover:bg-[#4E7AFF]/10 hover:scale-105 text-center flex items-center gap-2"
                      >
                        <PenLine className="w-4 h-4" />
                        Добавить тесткейс
                      </Button>

                      <Button
                        onClick={runTestCases}
                        disabled={isTestingCases}
                        className="px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 text-center flex items-center gap-2"
                      >
                        {isTestingCases ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Beaker className="w-4 h-4" />
                        )}
                        {isTestingCases ? "Тестирование..." : "Тестировать тесткейсы"}
                      </Button>
                    </div>

                    {testResults && (
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          Правильно: <span className="font-bold text-green-500">{testResults.correct_tests_count}</span> из <span className="font-bold">{testResults.tests_count}</span>
                          {testResults.stderr !== "Правильно" && (
                            <div className="text-red-500 mt-1">{testResults.stderr}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {saveResult?.success ? "Успех" : "Ошибка"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className={`text-lg ${saveResult?.success ? "text-green-500" : "text-red-500"}`}>
              {saveResult?.message}
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleResultClose}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
