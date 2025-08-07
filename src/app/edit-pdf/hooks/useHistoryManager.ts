
"use client";

import { useState, useCallback } from 'react';
import type { PageInfo, EditableObject } from '../lib/types';

interface HistoryState {
  pageInfos: PageInfo[];
  allObjects: Record<string, EditableObject>;
}

export function useHistoryManager(initialState: HistoryState) {
  const [history, setHistory] = useState<HistoryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const saveState = useCallback((newState: HistoryState) => {
    const newHistory = history.slice(0, currentIndex + 1);
    setHistory([...newHistory, newState]);
    setCurrentIndex(newHistory.length);
  }, [history, currentIndex]);
  
  const undo = () => {
    if (canUndo) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const redo = () => {
    if (canRedo) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return { 
    currentState: history[currentIndex] || initialState,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
  };
}
