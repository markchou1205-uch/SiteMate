
"use client";

import { useState, useCallback } from 'react';
import type { EditableObject } from '../lib/types';

export function useObjectManager() {
  const [allObjects, setAllObjects] = useState<Record<string, EditableObject>>({});

  const addObject = useCallback((obj: EditableObject) => {
    setAllObjects(prev => ({ ...prev, [obj.id]: obj }));
  }, []);

  const updateObject = useCallback((obj: EditableObject) => {
    setAllObjects(prev => {
        if (!prev[obj.id]) return prev; // Don't update if it doesn't exist
        return { ...prev, [obj.id]: { ...prev[obj.id], ...obj } };
    });
  }, []);

  const deleteObject = useCallback((id: string) => {
    setAllObjects(prev => {
      const newObjects = { ...prev };
      delete newObjects[id];
      return newObjects;
    });
  }, []);
  
  const getObjectsByPage = useCallback((pageNumber: number): EditableObject[] => {
      return Object.values(allObjects).filter(obj => obj.pageNumber === pageNumber);
  }, [allObjects]);

  return {
    allObjects,
    setAllObjects,
    addObject,
    updateObject,
    deleteObject,
    getObjectsByPage
  };
}
