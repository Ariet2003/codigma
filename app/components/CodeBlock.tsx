'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { nightOwl, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { theme } = useTheme();
  
  return (
    <div className="rounded-md overflow-hidden">
      <SyntaxHighlighter 
        language={language} 
        style={theme === 'dark' ? nightOwl : oneLight}
        customStyle={{ margin: 0, borderRadius: '0.375rem' }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
} 