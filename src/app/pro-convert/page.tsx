
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProConvertRedirector() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/edit-pdf'); // Redirect to the new pro mode editor page
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
      <p className="ml-4 text-lg text-foreground">Redirecting to Professional Mode...</p>
    </div>
  );
}
