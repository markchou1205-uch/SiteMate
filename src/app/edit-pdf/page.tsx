
"use client";
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const Editor = dynamic(() => import('./editor'), { 
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading Editor...</p>
    </div>
  ),
});

export default function PdfEditorPage() {
  return <Editor />;
}
