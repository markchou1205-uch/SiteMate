
"use client";

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { pdfjsLib } from '@/lib/pdf-worker';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { PageInfo } from '../lib/types';


export function usePdfInitialization() {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pageInfos, setPageInfos] = useState<PageInfo[]>([]);

  const loadPdf = useCallback(async (file: File) => {
    setIsLoading(true);
    console.log("[usePdfInitialization] Starting PDF load...");
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(doc);
      console.log(`[usePdfInitialization] PDF document loaded with ${doc.numPages} pages.`);

      // Create lightweight page info objects without fetching each page initially.
      const newPageInfos: PageInfo[] = Array.from({ length: doc.numPages }, (_, i) => ({
        id: uuidv4(),
        originalIndex: i,
        pageNumber: i + 1,
        width: 0, // Will be lazy-loaded
        height: 0, // Will be lazy-loaded
        rotation: 0, // Will be lazy-loaded
        thumbnailUrl: undefined, // Thumbnail will be rendered on demand
        canvasUrl: undefined, // Canvas will be rendered on demand
      }));
      
      console.log("[usePdfInitialization] Lightweight page metadata created. Setting state.");
      setPageInfos(newPageInfos);
      
      setIsLoading(false);
      console.log("[usePdfInitialization] PDF loading finished.");
      return { pageInfos: newPageInfos, pdfDoc: doc };

    } catch (error) {
      console.error("[usePdfInitialization] Error loading PDF:", error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return {
    pdfDoc,
    isLoading,
    pageInfos,
    setPageInfos,
    loadPdf,
  };
}
