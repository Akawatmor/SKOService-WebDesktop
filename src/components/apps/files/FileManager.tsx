'use client';

import React, { useState, useRef } from 'react';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  size?: number;
  modified: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('sko-files');
    return saved ? JSON.parse(saved) : [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveFiles = (newFiles: FileItem[]) => {
    setFiles(newFiles);
    localStorage.setItem('sko-files', JSON.stringify(newFiles));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newFile: FileItem = {
          name: file.name,
          type: 'file',
          content: reader.result as string,
          size: file.size,
          modified: new Date().toISOString(),
        };
        saveFiles([...files, newFile]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleDelete = (index: number) => {
    saveFiles(files.filter((_, i) => i !== index));
  };

  const handleDownload = (file: FileItem) => {
    if (!file.content) return;
    const link = document.createElement('a');
    link.href = file.content;
    link.download = file.name;
    link.click();
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/8">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-white/10 hover:bg-white/15 rounded-md text-xs text-white/70 transition-colors"
        >
          Upload Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
        <span className="text-xs text-white/30 ml-auto">
          {files.length} item{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
            <span className="text-4xl">📂</span>
            <span className="text-sm">No files yet</span>
            <span className="text-xs">Click &quot;Upload Files&quot; to add files</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-white/40 border-b border-white/5">
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-right px-3 py-2 font-medium w-20">Size</th>
                <th className="text-right px-3 py-2 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => (
                <tr
                  key={i}
                  className="hover:bg-white/5 transition-colors border-b border-white/3"
                >
                  <td className="px-3 py-2 text-white/70 truncate max-w-[200px]">
                    <span className="mr-2">
                      {file.type === 'folder' ? '📁' : '📄'}
                    </span>
                    <button
                      onClick={() => handleDownload(file)}
                      className="hover:text-white transition-colors hover:underline"
                    >
                      {file.name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-white/30 text-right">
                    {formatSize(file.size)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-white/20 hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
