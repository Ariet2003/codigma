import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { Code, Trophy, Clock, Info, ChevronLeft, CheckCircle2, XCircle, Calendar, FileCode, Database, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CodeBlock } from '../../../components/CodeBlock';

// Определяем типы для шаблонных кодов и тестов
interface CodeTemplate {
  language: string;
  baseTemplate: string;
  fullTemplate: string;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isExample: boolean;
}

async function getTask(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch task');
  }

  return response.json();
}

async function getTaskSubmissions(taskId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/${taskId}/submissions`,
    {
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }

  return response.json();
}

export default async function TaskDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const task = await getTask(params.id);
  if (!task) {
    notFound();
  }

  const submissions = await getTaskSubmissions(params.id);

  // Получаем шаблонные коды для разных языков
  const getTemplateCode = (language: string) => {
    const template = task.codeTemplates?.find((t: CodeTemplate) => t.language === language);
    return template?.baseTemplate || "Шаблонный код не найден";
  };

  const getFullTemplateCode = (language: string) => {
    const template = task.codeTemplates?.find((t: CodeTemplate) => t.language === language);
    return template?.fullTemplate || "Полный шаблонный код не найден";
  };

  // Определяем язык для подсветки синтаксиса
  const getLanguageForHighlight = (language: string) => {
    switch (language) {
      case 'cpp':
        return 'cpp';
      case 'js':
        return 'javascript';
      case 'rust':
        return 'rust';
      case 'java':
        return 'java';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Основная информация */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="hover:bg-transparent"
            >
              <Link href="/admin/tasks">
                <ChevronLeft className="w-6 h-6" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Code className="w-8 h-8 text-[#4E7AFF]" />
              {task.title}
            </h1>
          </div>
          <div className="prose max-w-none dark:prose-invert">
            <Markdown>{task.description}</Markdown>
          </div>
        </CardContent>
      </Card>

      {/* Информация о задаче */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="w-6 h-6 text-[#4E7AFF]" />
            Информация
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Сложность</p>
                <p className="font-medium">{task.difficulty}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm text-muted-foreground">Количество тестов</p>
                <p className="font-medium">{task.testCases?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Дата создания</p>
                <p className="font-medium">
                  {task.createdAt ? format(new Date(task.createdAt), 'dd MMMM yyyy', { locale: ru }) : 'Не указана'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Дата обновления</p>
                <p className="font-medium">
                  {task.updatedAt ? format(new Date(task.updatedAt), 'dd MMMM yyyy', { locale: ru }) : 'Не указана'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статистика решений */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#4E7AFF]" />
            Статистика решений
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Правильных решений</p>
                <p className="font-medium">{submissions.correctSolutions || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Неправильных решений</p>
                <p className="font-medium">{submissions.wrongSolutions || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Всего отправлено решений</p>
                <p className="font-medium">{submissions.totalSubmissions || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Среднее время выполнения</p>
                <p className="font-medium">{submissions.avgExecutionTime || 0} мс</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Среднее использование памяти</p>
                <p className="font-medium">{submissions.avgMemory || 0} МБ</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Тесты и шаблонные коды */}
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <Tabs defaultValue="tests">
            <TabsList className="mb-4">
              <TabsTrigger value="tests" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Тесты
              </TabsTrigger>
              <TabsTrigger value="cpp" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                C++
              </TabsTrigger>
              <TabsTrigger value="js" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="rust" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Rust
              </TabsTrigger>
              <TabsTrigger value="java" className="flex items-center gap-2">
                <FileCode className="w-4 h-4" />
                Java
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tests">
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      <TableHead>Входные данные</TableHead>
                      <TableHead>Ожидаемый результат</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {task.testCases && task.testCases.length > 0 ? (
                      task.testCases.map((test: TestCase, index: number) => (
                        <TableRow key={test.id || index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
                              <code>{test.input}</code>
                            </pre>
                          </TableCell>
                          <TableCell>
                            <pre className="bg-muted p-2 rounded-md overflow-x-auto text-sm">
                              <code>{test.expectedOutput}</code>
                            </pre>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                          Тесты не найдены
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="cpp">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Базовый шаблон</h3>
                  <CodeBlock 
                    code={getTemplateCode('cpp')}
                    language={getLanguageForHighlight('cpp')}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Полный шаблон</h3>
                  <CodeBlock 
                    code={getFullTemplateCode('cpp')}
                    language={getLanguageForHighlight('cpp')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="js">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Базовый шаблон</h3>
                  <CodeBlock 
                    code={getTemplateCode('js')}
                    language={getLanguageForHighlight('js')}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Полный шаблон</h3>
                  <CodeBlock 
                    code={getFullTemplateCode('js')}
                    language={getLanguageForHighlight('js')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="rust">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Базовый шаблон</h3>
                  <CodeBlock 
                    code={getTemplateCode('rust')}
                    language={getLanguageForHighlight('rust')}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Полный шаблон</h3>
                  <CodeBlock 
                    code={getFullTemplateCode('rust')}
                    language={getLanguageForHighlight('rust')}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="java">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Базовый шаблон</h3>
                  <CodeBlock 
                    code={getTemplateCode('java')}
                    language={getLanguageForHighlight('java')}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Полный шаблон</h3>
                  <CodeBlock 
                    code={getFullTemplateCode('java')}
                    language={getLanguageForHighlight('java')}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 