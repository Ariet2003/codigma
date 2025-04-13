"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Play, ChevronDown, Check, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';
import { ModeToggle } from '@/components/mode-toggle';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ReactMarkdown from 'react-markdown';
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Toaster } from "sonner";

type Task = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  functionName: string;
  inputParams: any;
  outputParams: any;
  isSolved: boolean;
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
  }[];
  codeTemplates: {
    id: string;
    language: string;
    baseTemplate: string;
    fullTemplate: string;
  }[];
  stats: {
    totalSubmissions: number;
    acceptedSubmissions: number;
    bestMemory?: number;
    bestTime?: number;
    languageStats: {
      language: string;
      totalAttempts: number;
      successfulAttempts: number;
      successRate: number;
    }[];
  };
};

const languages = [
  { id: 'cpp', name: 'C++' },
  { id: 'java', name: 'Java' },
  { id: 'js', name: 'JavaScript' },
  { id: 'rust', name: 'Rust' }
];

export default function TaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [testTab, setTestTab] = useState('example');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [selectedTest, setSelectedTest] = useState(0);
  const { theme } = useTheme();

  // Функция для получения кода из LocalStorage
  const getStoredCode = (taskId: string, language: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`code_${taskId}_${language}`);
  };

  // Функция для сохранения кода в LocalStorage
  const storeCode = (taskId: string, language: string, code: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`code_${taskId}_${language}`, code);
  };

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/u/tasks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        const data = await response.json();
        setTask(data);
        
        // Проверяем наличие сохраненного кода
        const storedCode = getStoredCode(id as string, selectedLanguage);
        if (storedCode) {
          setCode(storedCode);
        } else {
          setCode(data.codeTemplates.find((t: { language: string }) => t.language === selectedLanguage)?.baseTemplate || '');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, selectedLanguage]);

  // Сохраняем код при изменении
  useEffect(() => {
    if (task && code) {
      storeCode(id as string, selectedLanguage, code);
    }
  }, [code, id, selectedLanguage]);

  // Обновляем обработчик выбора языка
  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    const storedCode = getStoredCode(id as string, langId);
    if (storedCode) {
      setCode(storedCode);
    } else {
      const template = task?.codeTemplates.find(t => t.language === langId);
      setCode(template ? template.baseTemplate : '');
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/u/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: id,
          language: selectedLanguage,
          code
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        const errorMessage = error.error || 'Произошла ошибка при выполнении кода';
        setOutput(errorMessage);
        toast.error(errorMessage, {
          duration: 3000
        });
        return;
      }

      const result = await response.json();
      
      // Формируем вывод для каждого теста
      let outputText = '';
      result.tokens.forEach((token: string, index: number) => {
        const isCorrect = !result.incorrect_test_indexes.includes(index);
        outputText += `Тест ${index + 1}: ${isCorrect ? 'Успешно' : token}\n`;
      });

      // Добавляем информацию о времени выполнения и памяти, если есть
      if (result.first_stderr && !result.first_stderr.includes('Все тесты пройдены успешно')) {
        outputText += `\n${result.first_stderr}`;
      }

      setOutput(outputText);

      // Показываем уведомление о результатах
      if (result.correct_tests_count === result.tests_count) {
        toast.success("Задача решена!", {
          description: `Все тесты пройдены успешно (${result.correct_tests_count} из ${result.tests_count})`,
          duration: 3000
        });
      } else {
        toast.error("Есть ошибки", {
          description: `Пройдено ${result.correct_tests_count} из ${result.tests_count} тестов`,
          duration: 3000
        });
      }
    } catch (error) {
      const errorMessage = 'Произошла ошибка при выполнении кода';
      setOutput(errorMessage);
      toast.error(errorMessage, {
        duration: 3000
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: id,
          language: selectedLanguage,
          code
        })
      });
      
      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      setOutput('Произошла ошибка при отправке решения');
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Задача не найдена</h1>
          <p className="text-muted-foreground">Возможно, она была удалена или перемещена</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-65px)] -mx-6">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Описание задачи */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full overflow-y-auto border-r">
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/u/tasks')}
                    className="hover:bg-muted"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    К списку задач
                  </Button>
                </div>

                <div>
                  <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                      task.difficulty === 'easy' && "bg-green-500/10 text-green-500",
                      task.difficulty === 'medium' && "bg-yellow-500/10 text-yellow-500",
                      task.difficulty === 'hard' && "bg-red-500/10 text-red-500"
                    )}>
                      {task.difficulty}
                    </span>
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                      task.isSolved 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      {task.isSolved ? (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Решено
                        </>
                      ) : (
                        'Не решено'
                      )}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{task.description}</ReactMarkdown>
                  </div>

                  <div className="mt-8 pt-6 border-t space-y-4">
                    <h2 className="text-lg font-semibold">Статистика задачи</h2>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Всего решений</div>
                        <div className="text-2xl font-semibold">{task.stats.totalSubmissions}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Успешных решений</div>
                        <div className="text-2xl font-semibold text-green-500">{task.stats.acceptedSubmissions}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Лучшие показатели</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Память</div>
                          <div className="font-mono">{task.stats.bestMemory ? `${(task.stats.bestMemory / 1024 / 1024).toFixed(1)} MB` : '—'}</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground">Время</div>
                          <div className="font-mono">{task.stats.bestTime ? `${task.stats.bestTime} мс` : '—'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted/80 transition-colors data-[resize-handle-active]:bg-muted w-1.5" />

          {/* Редактор и тесты */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full">
              {/* Панель выбора языка */}
              <div className="border-b p-2 bg-muted/30">
                <div className="flex items-center justify-between">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-[140px] justify-between"
                      >
                        {languages.find(lang => lang.id === selectedLanguage)?.name}
                        <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[140px]">
                      {languages.map(lang => (
                        <DropdownMenuItem
                          key={lang.id}
                          onClick={() => handleLanguageChange(lang.id)}
                          className="justify-between"
                        >
                          {lang.name}
                          {selectedLanguage === lang.id && (
                            <Check className="w-4 h-4" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center gap-2">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                            onClick={handleRun}
                            disabled={isRunning}
                          >
                            {isRunning ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Выполняется...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                Запустить
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="bottom" 
                          className="bg-popover/95 px-3 py-1.5"
                        >
                          <p className="text-xs">Запустить код (Ctrl + Enter)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => router.push(`/u/tasks/${id}/submissions`)}
                          >
                            <History className="w-4 h-4" />
                            История
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="bottom" 
                          className="bg-popover/95 px-3 py-1.5"
                        >
                          <p className="text-xs">История решений</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>

              <ResizablePanelGroup direction="vertical" className="flex-1">
                {/* Редактор кода */}
                <ResizablePanel defaultSize={75} minSize={30}>
                  <div className="h-full">
                    <Editor
                      height="100%"
                      defaultLanguage={
                        selectedLanguage === 'cpp' ? 'cpp' :
                        selectedLanguage === 'java' ? 'java' :
                        selectedLanguage === 'js' ? 'javascript' :
                        selectedLanguage === 'rust' ? 'rust' :
                        'plaintext'
                      }
                      language={
                        selectedLanguage === 'cpp' ? 'cpp' :
                        selectedLanguage === 'java' ? 'java' :
                        selectedLanguage === 'js' ? 'javascript' :
                        selectedLanguage === 'rust' ? 'rust' :
                        'plaintext'
                      }
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme={theme === 'dark' ? 'vs-dark' : 'light'}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        tabSize: 4,
                        fontFamily: 'JetBrains Mono, monospace',
                        padding: { top: 16, bottom: 16 },
                        renderLineHighlight: 'none',
                        cursorStyle: 'line',
                        cursorWidth: 2,
                        roundedSelection: true,
                        scrollbar: {
                          vertical: 'visible',
                          horizontal: 'visible',
                          verticalScrollbarSize: 12,
                          horizontalScrollbarSize: 12,
                          alwaysConsumeMouseWheel: false
                        },
                        mouseWheelScrollSensitivity: 0.5,
                        multiCursorModifier: 'alt',
                        overviewRulerBorder: false,
                        hideCursorInOverviewRuler: true,
                        guides: {
                          indentation: false,
                          bracketPairs: false
                        },
                        colorDecorators: true,
                        bracketPairColorization: {
                          enabled: true,
                        },
                      }}
                      beforeMount={(monaco) => {
                        monaco.editor.defineTheme('light', {
                          base: 'vs',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#ffffff',
                            'editor.foreground': '#374151',
                            'editor.lineHighlightBackground': '#f3f4f6',
                            'editorLineNumber.foreground': '#9ca3af',
                            'editorLineNumber.activeForeground': '#374151',
                            'editor.selectionBackground': '#60a5fa40',
                            'editor.inactiveSelectionBackground': '#60a5fa20',
                            'editorIndentGuide.background': '#e5e7eb',
                            'editorIndentGuide.activeBackground': '#9ca3af',
                          },
                        });

                        monaco.editor.defineTheme('vs-dark', {
                          base: 'vs-dark',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#020817',
                            'editor.foreground': '#e5e7eb',
                            'editor.lineHighlightBackground': '#0f172a',
                            'editorLineNumber.foreground': '#475569',
                            'editorLineNumber.activeForeground': '#e5e7eb',
                            'editor.selectionBackground': '#60a5fa40',
                            'editor.inactiveSelectionBackground': '#60a5fa20',
                            'editorIndentGuide.background': '#1e293b',
                            'editorIndentGuide.activeBackground': '#475569',
                          },
                        });
                      }}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-muted/50 hover:bg-muted/80 transition-colors data-[resize-handle-active]:bg-muted h-1.5" />

                {/* Тесткейсы и результаты */}
                <ResizablePanel defaultSize={50} minSize={40}>
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-auto p-4">
                      <div className="space-y-4">
                        {/* Навигация по тестам */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-2">
                            {task.testCases.slice(0, 3).map((_, index) => (
                              <Button
                                key={index}
                                variant={selectedTest === index ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => setSelectedTest(index)}
                                className={cn(
                                  "min-w-[32px] h-8 px-2",
                                  output && output.includes(`Тест ${index + 1}: Успешно`) && "border-green-500 hover:border-green-600",
                                  output && output.includes(`Тест ${index + 1}:`) && !output.includes(`Тест ${index + 1}: Успешно`) && "border-red-500 hover:border-red-600"
                                )}
                              >
                                Тесткейс {index + 1}
                              </Button>
                            ))}
                          </div>
                          {task.testCases.length > 3 && (
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-[1px] bg-border" />
                              <div className="text-sm">
                                <span className="text-muted-foreground">Скрытые тесты:</span>{" "}
                                <span className="font-medium">{task.testCases.length - 3}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Текущий тест */}
                        {(() => {
                          if (!task.testCases.length) {
                            return (
                              <div className="text-sm text-muted-foreground text-center py-4">
                                Нет доступных тестов
                              </div>
                            );
                          }

                          const testCase = task.testCases[selectedTest];
                          if (selectedTest >= 3) {
                            setSelectedTest(0);
                            return null;
                          }
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium">Тестовый пример {selectedTest + 1}</div>
                                  {output && (
                                    <div className={cn(
                                      "text-xs px-1.5 py-0.5 rounded-full font-medium",
                                      output.includes(`Тест ${selectedTest + 1}: Успешно`) 
                                        ? "bg-green-500/10 text-green-500"
                                        : output.includes(`Тест ${selectedTest + 1}:`)
                                          ? "bg-red-500/10 text-red-500"
                                          : "hidden"
                                    )}>
                                      {output.includes(`Тест ${selectedTest + 1}: Успешно`) ? "Успешно" : "Ошибка"}
                                    </div>
                                  )}
                                </div>
                                {output && (
                                  <div className={cn(
                                    "text-sm px-2 py-1 rounded-md",
                                    output.split('\n').filter(line => line.includes(': Успешно')).length === task.testCases.length
                                      ? "bg-green-500/10 text-green-500"
                                      : "bg-red-500/10 text-red-500"
                                  )}>
                                    Пройдено тестов: {output.split('\n').filter(line => line.includes(': Успешно')).length} из {task.testCases.length}
                                  </div>
                                )}
                              </div>
                              <div className="grid gap-3">
                                <div className="space-y-1.5">
                                  <div className="text-xs font-medium text-muted-foreground">Входные данные:</div>
                                  <div className="p-2.5 bg-muted/30 rounded font-mono text-sm whitespace-pre">{testCase.input}</div>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-xs font-medium text-muted-foreground">Ожидаемый результат:</div>
                                  <div className="p-2.5 bg-muted/30 rounded font-mono text-sm whitespace-pre">{testCase.expectedOutput}</div>
                                </div>
                                {output && output.includes(`Тест ${selectedTest + 1}:`) && (
                                  <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-muted-foreground">Ваш результат:</div>
                                    <div className="p-2.5 bg-muted/30 rounded font-mono text-sm whitespace-pre">
                                      {output.split('\n')
                                        .filter(line => line.startsWith(`Тест ${selectedTest + 1}:`))
                                        .map(line => line.replace(`Тест ${selectedTest + 1}: `, ''))
                                        .join('\n')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    {output && output.includes('Время выполнения:') && (
                      <div className="border-t p-3 text-sm">
                        <div className="font-medium">Результаты выполнения</div>
                        <div className="mt-1.5 text-muted-foreground">
                          {output.split('\n')
                            .filter(line => line.includes('Время выполнения:') || line.includes('Использовано памяти:'))
                            .join('\n')}
                        </div>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <Toaster richColors position="top-center" />
    </>
  );
} 