
// This file is no longer needed as its content has been moved to src/app/page.tsx
// You can safely delete this file.
// To ensure the build doesn't break if it's somehow still referenced,
// we'll leave a placeholder redirect or minimal component.

"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PdfEditorPlaceholderPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/'); // Redirect to the new homepage
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="ml-4 text-lg text-foreground">Redirecting...</p>
    </div>
  );
}
