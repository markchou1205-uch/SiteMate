"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, RotateCw } from 'lucide-react';
import type { translations } from '@/lib/translations';

interface SuccessStateProps {
  message: string;
  onGoHome: () => void;
  onStartNew: () => void;
  texts: (typeof translations)['zh'] | (typeof translations)['en'];
}

const SuccessState: React.FC<SuccessStateProps> = ({ message, onGoHome, onStartNew, texts }) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center h-full">
      <div className="p-12 border rounded-lg bg-card shadow-lg w-full">
        <CheckCircle2 className="h-20 w-20 text-green-500 mb-6 mx-auto" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{texts.successTitle}</h2>
        <p className="text-lg text-muted-foreground mb-8">{message}</p>
        <div className="flex justify-center gap-4">
          <Button onClick={onGoHome} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            {texts.goHome}
          </Button>
          <Button onClick={onStartNew}>
            <RotateCw className="mr-2 h-4 w-4" />
            {texts.continueOther}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuccessState;
