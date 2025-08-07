
"use client";

import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  selectedObjectId: string | null;
  deleteObject: (id: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useKeyboardShortcuts({
  selectedObjectId,
  deleteObject,
  undo,
  redo,
  canUndo,
  canRedo,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete object
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
        e.preventDefault();
        deleteObject(selectedObjectId);
      }
      
      // Undo/Redo
      const isMetaKey = e.ctrlKey || e.metaKey;
      if (isMetaKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          if(canRedo) redo();
        } else {
          if(canUndo) undo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedObjectId, deleteObject, undo, redo, canUndo, canRedo]);
}
