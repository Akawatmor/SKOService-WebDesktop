'use client';

import React, { useState } from 'react';

function loadTextEditorState() {
  if (typeof window === 'undefined') return { content: '', fileName: 'untitled.txt' };
  const data = localStorage.getItem('sko-text-editor');
  if (data) {
    const parsed = JSON.parse(data);
    return { content: parsed.content || '', fileName: parsed.fileName || 'untitled.txt' };
  }
  return { content: '', fileName: 'untitled.txt' };
}

export default function TextEditor() {
  const [{ content: initialContent, fileName: initialFileName }] = useState(loadTextEditorState);
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState(initialFileName);
  const [saved, setSaved] = useState(true);

  const handleSave = () => {
    localStorage.setItem(
      'sko-text-editor',
      JSON.stringify({ content, fileName })
    );
    setSaved(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaved(false);
  };

  const handleNew = () => {
    setContent('');
    setFileName('untitled.txt');
    setSaved(true);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8">
        <button
          onClick={handleNew}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-md text-xs text-white/70 transition-colors"
        >
          New
        </button>
        <button
          onClick={handleSave}
          className="px-2.5 py-1 bg-[#0078d4] hover:bg-[#1a86d9] rounded-md text-xs text-white transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleDownload}
          className="px-2.5 py-1 bg-white/10 hover:bg-white/15 rounded-md text-xs text-white/70 transition-colors"
        >
          Download
        </button>
        <input
          type="text"
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
            setSaved(false);
          }}
          className="ml-2 text-xs bg-transparent border-b border-white/10 focus:border-[#0078d4] outline-none text-white/60 py-0.5 px-1 w-40"
          maxLength={100}
        />
        {!saved && (
          <span className="text-xs text-white/30 ml-auto">● Unsaved</span>
        )}
      </div>

      {/* Editor */}
      <textarea
        value={content}
        onChange={handleChange}
        className="flex-1 bg-transparent text-white/80 text-sm p-4 resize-none outline-none font-mono leading-relaxed"
        placeholder="Start typing..."
        spellCheck={false}
      />

      {/* Status bar */}
      <div className="flex items-center px-3 py-1 border-t border-white/5 text-[10px] text-white/30">
        <span>Lines: {content.split('\n').length}</span>
        <span className="mx-2">|</span>
        <span>Characters: {content.length}</span>
      </div>
    </div>
  );
}
