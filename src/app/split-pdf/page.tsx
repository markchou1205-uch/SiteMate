"use client";

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const SplitPdfClient = dynamic(() => import('./SplitPdfClient'), {
  ssr: false,
  loading: () => (
    <div className="p-8 w-full h-full flex items-center justify-center">
      <Skeleton className="h-[400px] w-full max-w-2xl" />
    </div>
  ),
})

export default function SplitPdfPage() {
  return <SplitPdfClient />
}
