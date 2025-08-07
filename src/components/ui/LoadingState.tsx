"use client";
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message: string;
  progress: number;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message, progress }) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center h-full">
      <div className="p-12 border rounded-lg bg-card shadow-lg w-full">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-6 mx-auto" />
        <p className="text-xl font-semibold text-foreground mb-4">{message}</p>
        <Progress value={progress} className="w-full" />
      </div>
    </div>
  );
};

export default LoadingState;
