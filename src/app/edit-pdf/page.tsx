
"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

const PdfEditor = dynamic(() => import('./PdfEditor'), { 
  ssr: false,
  loading: () => (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="w-full h-full p-4 space-y-4">
            <div className="flex gap-4 h-full">
                <Skeleton className="w-56 hidden md:block" />
                <Skeleton className="flex-1" />
            </div>
        </div>
      </div>
  ),
});

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please select a PDF file.',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFileSelect = () => {
    document.getElementById('pdf-upload-input')?.click();
  };
  
  const resetEditor = () => {
    setFile(null);
  };

  if (!file) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-2xl text-center shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">PDF Editor</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Open a PDF file to start editing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background p-12 transition-colors hover:border-primary"
              onClick={handleFileSelect}
            >
              <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-semibold">Click to browse or drag & drop a PDF here</p>
              <p className="text-sm text-muted-foreground">Maximum file size: 50MB</p>
            </div>
            <Input
              id="pdf-upload-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PdfEditor file={file} />;
}
