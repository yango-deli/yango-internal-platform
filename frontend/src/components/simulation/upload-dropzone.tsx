"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  uploading?: boolean;
  uploadProgress?: number;
}

export function UploadDropzone({
  onFileSelect,
  selectedFile,
  uploading,
  uploadProgress = 0,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) onFileSelect(acceptedFiles[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <FileSpreadsheet className="h-8 w-8 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-green-600">{formatSize(selectedFile.size)}</p>
          </div>
          {!uploading && (
            <button
              onClick={() => onFileSelect(null as unknown as File)}
              className="text-green-500 hover:text-green-700 p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-[#FFCC00] bg-yellow-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", isDragActive ? "bg-[#FFCC00]" : "bg-gray-100")}>
          <Upload className={cn("h-6 w-6", isDragActive ? "text-gray-900" : "text-gray-500")} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isDragActive ? "Drop your file here" : "Upload sellout file"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Drag & drop or click to browse — .xlsx files only
          </p>
        </div>
      </div>
    </div>
  );
}
