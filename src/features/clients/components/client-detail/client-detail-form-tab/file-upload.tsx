import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastViewport, ToastClose } from "@/shared/components/ui/toast";
import { Upload, X, Loader2, AlertCircle, FileImage, Eye } from 'lucide-react';
import { useFilesActions } from "@/shared/context/files-context";

import Image from "next/image";

interface FileUploadProps {
  isEditable: boolean;
  currentLogoUrl?: string;
  onFileUploaded: (fileUrl: string) => void;
  onFileRemoved: () => void;
  disabled?: boolean;
  container?: string;
  userId?: string;
}

interface ToastData {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const FileUpload: React.FC<FileUploadProps> = ({
  isEditable,
  currentLogoUrl = "",
  onFileUploaded,
  onFileRemoved,
  disabled = false,
  container = "",
  userId = ""
}) => {
  // States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastData, setToastData] = useState<ToastData | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Context
  const { addFile } = useFilesActions();
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  // Reset state when switching between edit modes
  useEffect(() => {
    if (!isEditable) {
      resetFileState();
    }
  }, [isEditable]);

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }

    // Check file size (5MB max)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > 5) {
      return "File size must be less than 5MB";
    }

    return null;
  };

  // Reset file-related state
  const resetFileState = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    setIsUploaded(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Handle file selection
  const handleFileSelect = (file: File | null) => {
    // Cleanup previous preview
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      resetFileState();
      return;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(file);
      setPreview(null);
      return;
    }

    // Set file and create preview
    setError(null);
    setSelectedFile(file);
    setIsUploaded(false);

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    previewUrlRef.current = previewUrl;
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile || error) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploadedFile = await addFile({
        container,
        userId,
        file: selectedFile,
      });

      if (uploadedFile) {
        const fileUrl = `${API_BASE_URL}/files/${uploadedFile.name}`;
        setIsUploaded(true);
        onFileUploaded(fileUrl);

        setToastData({
          title: "Upload successful",
          description: "Logo has been uploaded successfully.",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);

      setToastData({
        title: "Upload failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemove = () => {
    resetFileState();
    onFileRemoved();
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isEditable && !disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!isEditable || disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Determine what to show in the upload area
  const getDisplayContent = () => {
    if (preview) return preview; // New file preview
    if (currentLogoUrl && !selectedFile) return currentLogoUrl; // Existing logo
    return null;
  };

  const displayUrl = getDisplayContent();
  const hasExistingLogo = currentLogoUrl && !selectedFile;

  return (
    <ToastProvider>
      <div className="w-full space-y-3">
        {/* Label */}
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Logo
        </label>

        {/* Upload Area */}
        <div
          className={`
            relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg
            transition-all duration-200 overflow-hidden
            ${!isEditable || disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
            ${error ? 'border-red-500 bg-red-50 dark:bg-red-950' : ''}
            bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => isEditable && !disabled && inputRef.current?.click()}
        >
          {displayUrl ? (
            <div className="flex items-center justify-center w-full h-full">
              <Image
                src={displayUrl}
                alt="Logo"
                className="object-contain max-h-full max-w-full p-2"
                width={200}
                height={200}
                unoptimized
              />
              {/* View button for existing logo */}
              {hasExistingLogo && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(currentLogoUrl, '_blank');
                  }}
                >
                  <Eye className="w-3 h-3" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center px-4">
              <FileImage className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                {isEditable ? "Click to upload or drag and drop" : "No logo uploaded"}
              </p>
              {isEditable && (
                <p className="text-xs text-gray-400">
                  Images only • Max 5MB
                </p>
              )}
            </div>
          )}

          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*"
            disabled={!isEditable || disabled}
            onChange={handleInputChange}
          />
        </div>

        {/* Controls - Only show in edit mode */}
        {isEditable && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              >
                {hasExistingLogo ? 'Change Logo' : 'Select Logo'}
              </Button>

              {selectedFile && !error && !isUploaded && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  disabled={isUploading || disabled}
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              )}

              {hasExistingLogo && !selectedFile && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove Logo
                </Button>
              )}
            </div>

            <span className="text-xs text-gray-500">
              Images • Max 5MB
            </span>
          </div>
        )}

        {/* File Info Card - Only show when there's a selected file */}
        {selectedFile && (
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-3">
                {/* File Preview */}
                <div className="flex-shrink-0">
                  {preview ? (
                    <Image src={preview} alt="Thumbnail" className="w-10 h-10 object-cover rounded" width={50} height={50} />
                  ) : (
                    <FileImage className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-grow min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </span>
                    {error && (
                      <span className="text-xs text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {error}
                      </span>
                    )}
                    {isUploading && (
                      <span className="text-xs text-blue-500">Uploading...</span>
                    )}
                    {isUploaded && (
                      <span className="text-xs text-green-500">Uploaded</span>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                {!isUploaded && !isUploading && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFileState}
                    className="p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Toast */}
        {toastData && (
          <Toast onOpenChange={(open) => !open && setToastData(null)}>
            <div className="grid gap-1">
              <ToastTitle>{toastData.title}</ToastTitle>
              {toastData.description && (
                <ToastDescription>{toastData.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};
