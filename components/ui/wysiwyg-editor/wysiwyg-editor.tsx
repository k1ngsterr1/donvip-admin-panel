"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "./wysiwyg-editor.css";

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  height?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Начните писать...",
  className,
  height = "300px",
}: WysiwygEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Toolbar */}
      <div className="wysiwyg-toolbar flex items-center gap-2 p-2 border-b bg-gray-50">
        <button
          type="button"
          onClick={() => formatText("bold")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Жирный"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText("italic")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Курсив"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText("underline")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Подчеркнутый"
        >
          <u>U</u>
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          type="button"
          onClick={() => formatText("formatBlock", "h1")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Заголовок 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => formatText("formatBlock", "h2")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Заголовок 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => formatText("formatBlock", "h3")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Заголовок 3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          type="button"
          onClick={() => formatText("insertUnorderedList")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Маркированный список"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => formatText("insertOrderedList")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Нумерованный список"
        >
          1. List
        </button>
        <div className="w-px h-6 bg-gray-300" />
        <button
          type="button"
          onClick={() => {
            const url = prompt("Введите URL:");
            if (url) formatText("createLink", url);
          }}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Ссылка"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => formatText("unlink")}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Удалить ссылку"
        >
          Unlink
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        className="wysiwyg-content p-4 min-h-[200px] outline-none prose max-w-none"
        style={{ height }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
}
