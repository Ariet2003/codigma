"use client";

import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface MonacoEditorProps {
  value: string;
  language: string;
  height?: string;
  onChange?: (value: string | undefined) => void;
  options?: Record<string, any>;
}

export function MonacoEditor({
  value,
  language,
  height = "200px",
  onChange,
  options = {},
}: MonacoEditorProps) {
  const { theme } = useTheme();

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={theme === "dark" ? "vs-dark" : "light"}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        ...options,
      }}
      loading={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    />
  );
} 