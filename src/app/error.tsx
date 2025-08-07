'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // In a real app, you'd send this to a logging service like Sentry, LogRocket, etc.
    console.error("Caught by global error boundary:", error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
           <div className="mx-auto bg-destructive/10 p-4 rounded-full w-fit mb-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">系統發生非預期的狀況</CardTitle>
          <CardDescription>
            我們已將錯誤資訊自動回報給系統管理人員進行處理，造成您的不便，我們深感抱歉。
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => reset()}>
            請再試一次
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
