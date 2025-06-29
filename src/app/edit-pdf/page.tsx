"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PdfEditor = dynamic(() => import('./components/PdfEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">Loading Editor...</p>
    </div>
  ),
});

export default function Page() {
  return <PdfEditor />;
}
