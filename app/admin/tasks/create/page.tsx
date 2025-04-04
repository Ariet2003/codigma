"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import { 
  FileText, 
  BarChart, 
  PenLine, 
  Eye, 
  Wand2,
  Loader2,
  X
} from "lucide-react";
import { generateProblemTemplates } from "../../../lib/codeGenerator";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from "next-themes";

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

// Ключи для localStorage
const STORAGE_KEYS = {
  title: 'create_task_title',
  difficulty: 'create_task_difficulty',
  description: 'create_task_description',
  showMarkdown: 'create_task_show_markdown',
  functionName: 'create_task_function_name',
  inputParams: 'create_task_input_params',
  outputParams: 'create_task_output_params',
  codeTemplates: 'create_task_code_templates',
  selectedLanguage: 'create_task_selected_language'
};

export default function CreateTask() {
  // Инициализируем состояние из localStorage или используем значения по умолчанию
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [description, setDescription] = useState("");
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Состояния для генератора шаблонного кода
  const [functionName, setFunctionName] = useState("");
  const [inputParams, setInputParams] = useState<Parameter[]>([
    { id: crypto.randomUUID(), name: "", type: "" }
  ]);
  const [outputParams, setOutputParams] = useState<Parameter[]>([
    { id: crypto.randomUUID(), name: "", type: "" }
  ]);

  const [selectedLanguage, setSelectedLanguage] = useState<string>("cpp");
  const [codeTemplates, setCodeTemplates] = useState<CodeTemplates | null>(null);
  const { theme } = useTheme();

  // Функции для управления параметрами
  const addInputParam = () => {
    setInputParams([...inputParams, { id: crypto.randomUUID(), name: "", type: "" }]);
  };

  const addOutputParam = () => {
    setOutputParams([...outputParams, { id: crypto.randomUUID(), name: "", type: "" }]);
  };

  const removeInputParam = (id: string) => {
    if (inputParams.length > 1) {
      setInputParams(inputParams.filter(param => param.id !== id));
    }
  };

  const removeOutputParam = (id: string) => {
    if (outputParams.length > 1) {
      setOutputParams(outputParams.filter(param => param.id !== id));
    }
  };

  const updateInputParam = (id: string, field: 'name' | 'type', value: string) => {
    setInputParams(inputParams.map(param =>
      param.id === id ? { ...param, [field]: value } : param
    ));
  };

  const updateOutputParam = (id: string, field: 'name' | 'type', value: string) => {
    setOutputParams(outputParams.map(param =>
      param.id === id ? { ...param, [field]: value } : param
    ));
  };

  // Загружаем данные из localStorage при первом рендере
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const savedTitle = localStorage.getItem(STORAGE_KEYS.title);
      const savedDifficulty = localStorage.getItem(STORAGE_KEYS.difficulty);
      const savedDescription = localStorage.getItem(STORAGE_KEYS.description);
      const savedShowMarkdown = localStorage.getItem(STORAGE_KEYS.showMarkdown);
      const savedFunctionName = localStorage.getItem(STORAGE_KEYS.functionName);
      const savedInputParams = localStorage.getItem(STORAGE_KEYS.inputParams);
      const savedOutputParams = localStorage.getItem(STORAGE_KEYS.outputParams);
      const savedCodeTemplates = localStorage.getItem(STORAGE_KEYS.codeTemplates);
      const savedSelectedLanguage = localStorage.getItem(STORAGE_KEYS.selectedLanguage);

      if (savedTitle) setTitle(savedTitle);
      if (savedDifficulty) setDifficulty(savedDifficulty);
      if (savedDescription) setDescription(savedDescription);
      if (savedShowMarkdown) setShowMarkdown(savedShowMarkdown === 'true');
      if (savedFunctionName) setFunctionName(savedFunctionName);
      if (savedInputParams) setInputParams(JSON.parse(savedInputParams));
      if (savedOutputParams) setOutputParams(JSON.parse(savedOutputParams));
      if (savedCodeTemplates) setCodeTemplates(JSON.parse(savedCodeTemplates));
      if (savedSelectedLanguage) setSelectedLanguage(savedSelectedLanguage);
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Сохраняем изменения в localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem(STORAGE_KEYS.title, title);
      localStorage.setItem(STORAGE_KEYS.difficulty, difficulty);
      localStorage.setItem(STORAGE_KEYS.description, description);
      localStorage.setItem(STORAGE_KEYS.showMarkdown, showMarkdown.toString());
      localStorage.setItem(STORAGE_KEYS.functionName, functionName);
      localStorage.setItem(STORAGE_KEYS.inputParams, JSON.stringify(inputParams));
      localStorage.setItem(STORAGE_KEYS.outputParams, JSON.stringify(outputParams));
      localStorage.setItem(STORAGE_KEYS.codeTemplates, JSON.stringify(codeTemplates));
      localStorage.setItem(STORAGE_KEYS.selectedLanguage, selectedLanguage);
    }
  }, [title, difficulty, description, showMarkdown, functionName, inputParams, outputParams, codeTemplates, selectedLanguage, isInitialized]);

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

  const generateTemplates = () => {
    const metadata = {
      task_name: title,
      difficulty: difficulty,
      description: description,
      function_name: functionName,
      inputs: inputParams.map(({ name, type }) => ({ name, type })),
      outputs: outputParams.map(({ name, type }) => ({ name, type }))
    };

    const templates = generateProblemTemplates(metadata);
    setCodeTemplates(templates);
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

  // Функция для очистки формы
  const clearForm = () => {
    setTitle("");
    setDifficulty("");
    setDescription("");
    setShowMarkdown(false);
    setFunctionName("");
    setInputParams([{ id: crypto.randomUUID(), name: "", type: "" }]);
    setOutputParams([{ id: crypto.randomUUID(), name: "", type: "" }]);
    setCodeTemplates(null);
    setSelectedLanguage("cpp");
    
    // Очищаем localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4E7AFF]">
            Создать задачу
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={clearForm}
          className="px-6 py-3 rounded-lg border border-[#4E7AFF] text-[#4E7AFF] dark:text-white font-medium transition-all hover:bg-[#4E7AFF]/10 hover:scale-105"
        >
          Очистить форму
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
              Генератор шаблонного кода
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
              <Input
                id="functionName"
                placeholder="Введите название функции"
                className="border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Структура входных данных</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Входные переменные */}
                <div className="space-y-2 rounded-lg border border-color-[hsl(var(--border))] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Входные параметры</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-4 py-2 rounded-lg border border-[#4E7AFF] text-[#4E7AFF] dark:text-white font-medium transition-all hover:bg-[#4E7AFF]/10 hover:scale-105"
                      onClick={addInputParam}
                    >
                      Добавить параметр
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {inputParams.map((param) => (
                      <div key={param.id} className="flex gap-4 items-center">
                        <Input
                          placeholder="Название параметра"
                          className="flex-1 border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
                          value={param.name}
                          onChange={(e) => updateInputParam(param.id, 'name', e.target.value)}
                        />
                        <Select
                          value={param.type}
                          onValueChange={(value) => updateInputParam(param.id, 'type', value)}
                        >
                          <SelectTrigger className="w-[180px] border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30">
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="int">int</SelectItem>
                            <SelectItem value="float">float</SelectItem>
                            <SelectItem value="string">string</SelectItem>
                            <SelectItem value="bool">bool</SelectItem>
                            <SelectItem value="list<int>">list&lt;int&gt;</SelectItem>
                            <SelectItem value="list<float>">list&lt;float&gt;</SelectItem>
                            <SelectItem value="list<string>">list&lt;string&gt;</SelectItem>
                            <SelectItem value="list<bool>">list&lt;bool&gt;</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#4E7AFF] hover:text-red-500 transition-all"
                          onClick={() => removeInputParam(param.id)}
                          disabled={inputParams.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Выходные переменные */}
                <div className="space-y-2 rounded-lg border border-color-[hsl(var(--border))] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Выходные параметры</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-4 py-2 rounded-lg border border-[#4E7AFF] text-[#4E7AFF] dark:text-white font-medium transition-all hover:bg-[#4E7AFF]/10 hover:scale-105"
                      onClick={addOutputParam}
                    >
                      Добавить параметр
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {outputParams.map((param) => (
                      <div key={param.id} className="flex gap-4 items-center">
                        <Input
                          placeholder="Название параметра"
                          className="flex-1 border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30"
                          value={param.name}
                          onChange={(e) => updateOutputParam(param.id, 'name', e.target.value)}
                        />
                        <Select
                          value={param.type}
                          onValueChange={(value) => updateOutputParam(param.id, 'type', value)}
                        >
                          <SelectTrigger className="w-[180px] border border-color-[hsl(var(--border))] bg-transparent text-foreground focus:ring-2 focus:ring-[#4E7AFF]/30">
                            <SelectValue placeholder="Выберите тип" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="int">int</SelectItem>
                            <SelectItem value="float">float</SelectItem>
                            <SelectItem value="string">string</SelectItem>
                            <SelectItem value="bool">bool</SelectItem>
                            <SelectItem value="list<int>">list&lt;int&gt;</SelectItem>
                            <SelectItem value="list<float>">list&lt;float&gt;</SelectItem>
                            <SelectItem value="list<string>">list&lt;string&gt;</SelectItem>
                            <SelectItem value="list<bool>">list&lt;bool&gt;</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-[#4E7AFF] hover:text-red-500 transition-all"
                          onClick={() => removeOutputParam(param.id)}
                          disabled={outputParams.length === 1}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button 
                className="px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 text-center"
                disabled={!functionName || inputParams.some(p => !p.name || !p.type) || outputParams.some(p => !p.name || !p.type)}
                onClick={generateTemplates}
              >
                Создать шаблон
              </Button>
            </div>
          </div>
        </div>

        {codeTemplates && (
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
        )}
      </div>
    </div>
  );
} 