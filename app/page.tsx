"use client";

import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { 
  UploadCloud, X, Copy, Download, 
  Terminal, Image as ImageIcon 
} from "lucide-react";
import { toast } from "sonner";
import { saveAs } from "file-saver";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConvertedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
}

export default function SupabaseConverter() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) toast.error("Invalid file type.");
    if (files.length + acceptedFiles.length > 10) {
      toast.error("Max 10 files allowed.");
      return;
    }

    const newFilesPromises = acceptedFiles.map(async (file) => {
      const base64 = await convertToBase64(file);
      return {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        base64: base64,
      };
    });

    const processedFiles = await Promise.all(newFilesPromises);
    setFiles((prev) => [...prev, ...processedFiles]);
    toast.success(`${processedFiles.length} images processed`);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 10,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    disabled: files.length >= 10
  });

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Navbar - Fixed Max Width to Align with Main Content */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 bg-emerald-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Terminal className="h-4 w-4 text-black" />
            </div>
            <span className="font-semibold tracking-tight text-lg">
              Base64<span className="text-zinc-500">Converter</span>
            </span>
          </div>
          {/* Right side text aligned with the end of the upload box */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-zinc-500 uppercase tracking-widest hidden sm:inline">
              Devloped By Mahtabul Shourav
            </span>
            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full p-6 space-y-10">
        
        {/* Hero Section - Aligned Left */}
        <section className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-white tracking-tight">Upload Images</h1>
            <p className="text-zinc-400 text-sm">Convert up to 10 images directly in your browser. Security intact.</p>
          </div>

          {/* Dropzone - Aligned with Navbar Container */}
          <div 
            {...getRootProps()} 
            className={`
              group border border-zinc-800 rounded-lg h-56 flex flex-col items-center justify-center transition-all cursor-pointer bg-zinc-900/10
              ${isDragActive ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/50" : "hover:border-zinc-700 hover:bg-zinc-900/30"}
              ${files.length >= 10 ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            <div className="bg-zinc-900 p-4 rounded-xl mb-4 border border-zinc-800 text-emerald-500 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-200">
                {isDragActive ? "Drop to convert" : "Click to upload or drag and drop"}
              </p>
              <p className="text-[10px] text-zinc-600 mt-2 font-mono tracking-widest uppercase">
                JPG • PNG • WEBP (MAX 10)
              </p>
            </div>
          </div>
        </section>

        {/* Results - Aligned with Navbar Container */}
        {files.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-2 duration-700 space-y-4 pb-20">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">Conversion Queue</h2>
              <button 
                className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-red-400 transition-colors" 
                onClick={() => setFiles([])}
              >
                Clear All
              </button>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-900 bg-zinc-900/20 hover:border-zinc-800 transition-all">
                  
                  <div className="h-10 w-10 shrink-0 rounded border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
                    <img src={file.base64} alt="preview" className="h-full w-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter">
                      {(file.size / 1024).toFixed(1)} KB • {file.type.replace('image/', '')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => copyToClipboard(`![${file.name}](${file.base64})`, "Markdown Copied")}
                      variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-900/50"
                    >
                      Markdown
                    </Button>

                    <Button 
                      onClick={() => copyToClipboard(file.base64, "Raw Base64 Copied")}
                      variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    >
                      Copy
                    </Button>
                    
                    <Button 
                      onClick={() => saveAs(new Blob([file.base64], { type: "text/plain" }), `${file.name}.txt`)}
                      variant="secondary" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-tight bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    >
                      .TXT
                    </Button>

                    <Button 
                      onClick={() => removeFile(file.id)}
                      variant="ghost" size="icon" className="h-8 w-8 text-zinc-700 hover:text-red-500 hover:bg-transparent"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}