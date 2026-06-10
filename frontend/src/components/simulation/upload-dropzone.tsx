"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiUploadDropzoneProps {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function MultiUploadDropzone({ files, onAdd, onRemove, disabled }: MultiUploadDropzoneProps) {
  const onDrop = useCallback(
    (accepted: File[]) => { if (accepted.length) onAdd(accepted); },
    [onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 20,
    disabled,
  });

  const fmt = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  return (
    <div className="space-y-2">
      {files.map((f, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <FileSpreadsheet className="h-5 w-5 text-green-600 flex-shrink-0" />
          <span className="flex-1 text-xs font-medium text-green-900 truncate">{f.name}</span>
          <span className="text-xs text-green-600 flex-shrink-0">{fmt(f.size)}</span>
          {!disabled && (
            <button type="button" onClick={() => onRemove(i)} className="text-green-400 hover:text-green-700 p-0.5 rounded">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ))}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors",
          isDragActive ? "border-[#FFCC00] bg-yellow-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", isDragActive ? "bg-[#FFCC00]" : "bg-gray-100")}>
            <Upload className={cn("h-5 w-5", isDragActive ? "text-gray-900" : "text-gray-500")} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">
              {isDragActive ? "Drop files here" : files.length ? "Add more files" : "Upload sellout files"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Drop multiple .xlsx files or click to browse</p>
          </div>
        </div>
      </div>
    </div>
  );
}
