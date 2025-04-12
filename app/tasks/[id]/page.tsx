"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
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

type Task = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  functionName: string;
  inputParams: any;
  outputParams: any;
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
};

const languages = [
  { id: 'java', name: 'Java' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' }
];

export default function TaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [testTab, setTestTab] = useState('example');
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${id}`);
        if (!response.ok) throw new Error('Failed to fetch task');
        const data = await response.json();
        setTask(data);
        setCode(data.codeTemplates.find(t => t.language === selectedLanguage)?.fullTemplate || '');
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      const response = await fetch('/api/tasks/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: id,
          language: selectedLanguage,
          code,
          type: testTab
        })
      });
      
      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      setOutput('Произошла ошибка при выполнении кода');
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
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        {/* Описание задачи */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
              <div className="px-4 py-2 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/u/tasks')}
                  className="hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  К списку задач
                </Button>
                <ModeToggle />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4">
                <h1 className="text-xl font-bold mb-2">{task.title}</h1>
                <div className="mb-4">
                  <span className={cn(
                    "inline-block px-3 py-1 rounded-full text-sm font-medium",
                    task.difficulty === 'easy' && "bg-green-500/10 text-green-500",
                    task.difficulty === 'medium' && "bg-yellow-500/10 text-yellow-500",
                    task.difficulty === 'hard' && "bg-red-500/10 text-red-500"
                  )}>
                    {task.difficulty}
                  </span>
                </div>
                
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Редактор и тесты */}
        <ResizablePanel defaultSize={60}>
          <div className="h-full flex flex-col">
            {/* Панель выбора языка */}
            <div className="border-b py-1.5 px-2 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {languages.map(lang => (
                    <Button
                      key={lang.id}
                      variant={selectedLanguage === lang.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        const template = task.codeTemplates.find(t => t.language === lang.id);
                        setCode(template ? template.fullTemplate : '');
                      }}
                      className="h-7 px-2.5"
                    >
                      {lang.name}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRun}
                    disabled={isRunning}
                    className="h-7"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Выполняется...
                      </>
                    ) : (
                      'Запустить'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isRunning}
                    className="h-7"
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      'Отправить'
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Редактор кода */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage={selectedLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  tabSize: 4,
                  padding: { top: 8, bottom: 8 },
                }}
              />
            </div>

            {/* Тесткейсы и результаты */}
            <div className="h-[140px] border-t">
              <Tabs value={testTab} onValueChange={setTestTab} className="h-full">
                <div className="flex items-center px-3 py-1.5 border-b">
                  <TabsList className="h-7">
                    <TabsTrigger value="example" className="h-7 px-3">Примеры</TabsTrigger>
                    <TabsTrigger value="custom" className="h-7 px-3">Свой тест</TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-3 h-[calc(100%-33px)] overflow-auto custom-scrollbar">
                  <TabsContent value="example" className="h-full m-0 p-0">
                    <div className="font-mono text-sm whitespace-pre-wrap">
                      {output || 'Нажмите "Запустить" для проверки примеров'}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="custom" className="h-full m-0 p-0">
                    <textarea
                      className="w-full h-full p-2 font-mono text-sm bg-muted/30 rounded border resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Введите свои тестовые данные..."
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--muted-foreground) / 0.2);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.3);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
        }
      `}</style>
    </div>
  );
} 