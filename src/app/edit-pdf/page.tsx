
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument as PDFLibDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import Sortable from 'sortablejs';
import { v4 as uuidv4 } from 'uuid';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toggle } from '@/components/ui/toggle';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageObject {
  id: string;
  sourceCanvas: HTMLCanvasElement;
  rotation: number;
}

interface LinkAnnotationDef {
  type: 'url' | 'page';
  value: string;
}

interface TextSegment {
  text: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface TextAnnotation {
  id: string;
  type: 'text';
  pageIndex: number;
  segments: TextSegment[];
  topRatio: number;
  leftRatio: number;
  widthRatio: number;
  heightRatio: number;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  link?: LinkAnnotationDef;
  isUserAction?: boolean;
}

interface EditorState {
  pageObjects: PageObject[];
  annotations: Annotation[];
}

type Annotation = TextAnnotation;

type Tool = 'select' | 'text';
type InteractionMode = 'idle' | 'selected' | 'editing';

const translations = {
  zh: {
    pageTitle: 'PDF 編輯器 (專業模式)',
    uploadLabel: '選擇要編輯的 PDF 檔案：',
    downloadPdf: '另存為 PDF',
    toolSelect: '選取',
    toolText: '文字',
    textAnnotationSample: '輸入文字',
    loadError: "載入失敗",
    loadingPdf: "正在載入 PDF..."
  }
};

const fonts = [
  { name: 'Arial', value: 'Helvetica' },
  { name: 'Times New Roman', value: 'Times-Roman' },
  { name: 'Courier', value: 'Courier' },
];

const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];

const TextAnnotationToolbar = ({ annotation, onAnnotationChange, onDelete }: {
  annotation: TextAnnotation;
  onAnnotationChange: (id: string, annotation: Partial<TextAnnotation>) => void;
  onDelete: (id: string) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStyleChange = (style: Partial<TextSegment>) => {
    onAnnotationChange(annotation.id, {
        segments: annotation.segments.map(s => ({ ...s, ...style })),
      });
  };

  return (
    <div className="text-toolbar bg-card p-2 rounded-lg shadow-lg border flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
      <Select value={annotation.fontFamily} onValueChange={(value) => onAnnotationChange(annotation.id, { fontFamily: value })}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map(font => <SelectItem key={font.value} value={font.value} className="text-xs">{font.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={String(annotation.fontSize)} onValueChange={(value) => onAnnotationChange(annotation.id, { fontSize: Number(value) })}>
        <SelectTrigger className="w-[60px] h-8 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map(size => <SelectItem key={size} value={String(size)} className="text-xs">{size}</SelectItem>)}
        </SelectContent>
      </Select>
      <Separator orientation="vertical" className="h-6" />
      <Toggle pressed={annotation.segments[0]?.bold} onPressedChange={(pressed) => handleStyleChange({ bold: pressed })}>
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle pressed={annotation.segments[0]?.italic} onPressedChange={(pressed) => handleStyleChange({ italic: pressed })}>
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle pressed={annotation.segments[0]?.underline} onPressedChange={(pressed) => handleStyleChange({ underline: pressed })}>
        <Underline className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="h-6" />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: annotation.segments[0]?.color || '#000000' }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0">
          <Input 
            type="color" 
            value={annotation.segments[0]?.color || '#000000'} 
            onChange={(e) => handleStyleChange({ color: e.target.value })}
            className="w-14 h-10 p-1 border-0 cursor-pointer"
          />
        </PopoverContent>
      </Popover>
      <Separator orientation="vertical" className="h-6" />
      <ToggleGroup type="single" value={annotation.textAlign} onValueChange={(value: TextAnnotation['textAlign']) => value && onAnnotationChange(annotation.id, { textAlign: value })}>
        <ToggleGroupItem value="left"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
        <ToggleGroupItem value="center"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
        <ToggleGroupItem value="right"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
      </ToggleGroup>
      <Separator orientation="vertical" className="h-6" />
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(annotation.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const TextAnnotationComponent = ({
  annotation,
  mainCanvasZoom,
  isSelected,
  isEditing,
  isHovered,
  onAnnotationChange,
  onSelect,
  onEdit,
  onDragStart,
  onResizeStart,
  onHover,
}: {
  annotation: TextAnnotation;
  mainCanvasZoom: number;
  isSelected: boolean;
  isEditing: boolean;
  isHovered: boolean;
  onAnnotationChange: (id: string, annotation: Partial<TextAnnotation>) => void;
  onSelect: (e: React.MouseEvent, id: string) => void;
  onEdit: (e: React.MouseEvent, id: string) => void;
  onDragStart: (e: React.MouseEvent, id: string) => void;
  onResizeStart: (e: React.MouseEvent, id: string) => void;
  onHover: (id: string | null) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (isEditing && textarea) {
      textarea.focus();
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    } else if (!isEditing && textarea) {
      textarea.selectionStart = 0;
      textarea.selectionEnd = 0;
    }
  }, [isEditing, annotation.segments, annotation.fontSize, mainCanvasZoom, annotation.fontFamily]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAnnotationChange(annotation.id, { segments: [{...annotation.segments[0], text: e.target.value}] });
  };

  return (
    <div
      onMouseDown={(e) => {
        if (!isEditing) onDragStart(e, annotation.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e, annotation.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(e, annotation.id);
      }}
      onMouseEnter={() => onHover(annotation.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "absolute group/text-annotation",
        !isEditing && "cursor-grab",
        (isSelected || isHovered) && !isEditing && "border-2 border-dashed border-primary",
        isEditing && "border-2 border-solid border-primary"
      )}
      style={{
        left: `${annotation.leftRatio * 100}%`,
        top: `${annotation.topRatio * 100}%`,
        width: `${annotation.widthRatio * 100}%`,
        height: 'auto',
        zIndex: 20,
      }}
    >
      {isEditing ? (
        <Textarea
          ref={textareaRef}
          value={annotation.segments.map(s => s.text).join('')}
          onChange={handleTextChange}
          onClick={(e) => {
            if (isEditing) e.stopPropagation();
          }}
          disabled={!isEditing}
          className={cn(
            "w-full p-0 bg-transparent border-0 resize-none focus:ring-0 overflow-hidden",
            isEditing ? "cursor-text pointer-events-auto" : "pointer-events-none"
          )}
          style={{
            fontFamily: annotation.fontFamily.includes('Times') ? '"Times New Roman", Times, serif' : annotation.fontFamily,
            fontSize: `${annotation.fontSize * mainCanvasZoom}px`,
            textAlign: annotation.textAlign,
            lineHeight: 1.3,
          }}
        />
      ) : (
        <div
          className="w-full p-0 bg-transparent pointer-events-none"
          style={{
            fontFamily: annotation.fontFamily.includes('Times') ? '"Times New Roman", Times, serif' : annotation.fontFamily,
            fontSize: `${annotation.fontSize * mainCanvasZoom}px`,
            textAlign: annotation.textAlign,
            lineHeight: 1.3,
            wordBreak: 'break-word'
          }}
        >
          {annotation.segments.map((segment, index) => (
            <span
              key={index}
              style={{
                fontWeight: segment.bold ? 'bold' : 'normal',
                fontStyle: segment.italic ? 'italic' : 'normal',
                textDecoration: segment.underline ? 'underline' : 'none',
                color: segment.color,
              }}
            >
              {segment.text}
            </span>
          ))}
        </div>
      )}
      {(isSelected || isHovered) && !isEditing && (
        <div
          className="absolute -right-1 -bottom-1 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-se-resize"
          onMouseDown={(e) => onResizeStart(e, annotation.id)}
        />
      )}
    </div>
  );
};

export default function PdfEditorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentLanguage] = useState<'zh'>('zh');
  const texts = translations[currentLanguage];

  const [pageObjects, setPageObjects] = useState<PageObject[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null);
  const [mainCanvasZoom, setMainCanvasZoom] = useState(1);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [hoveredAnnotationId, setHoveredAnnotationId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('idle');
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const saveStateToHistory = useCallback(() => {
    const currentState = { pageObjects, annotations };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, pageObjects, annotations]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if(target.closest('.page-canvas')) {
       if (interactionMode === 'editing') {
          setInteractionMode('selected');
       } else if (activeTool === 'select') {
         setSelectedAnnotationId(null);
         setInteractionMode('idle');
         setHoveredAnnotationId(null);
       }
    }
  };

  const onAnnotationChange = (id: string, updates: Partial<TextAnnotation>) => {
    setAnnotations(prev => prev.map(ann => ann.id === id ? { ...ann, ...updates } : ann));
    saveStateToHistory();
  };

  const onDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(ann => ann.id !== id));
    setSelectedAnnotationId(null);
    setInteractionMode('idle');
    saveStateToHistory();
  };

  const onSelectAnnotation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    setInteractionMode('selected');
  };

  const onEditAnnotation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    setInteractionMode('editing');
  };

  const onDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    setInteractionMode('selected');
    // Implement drag logic if needed
  };

  const onResizeStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotationId(id);
    setInteractionMode('selected');
    // Implement resize logic if needed
  };

  const onHoverAnnotation = (id: string | null) => {
    setHoveredAnnotationId(id);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
      const newPageObjects: PageObject[] = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        newPageObjects.push({ id: uuidv4(), sourceCanvas: canvas, rotation: 0 });
      }

      setPageObjects(newPageObjects);
      setActivePageIndex(0);
      setAnnotations([]);
      setHistory([]);
      setHistoryIndex(-1);
      toast({ title: "PDF 載入成功", description: `${pdfDoc.numPages} 頁已載入` });
    } catch (error) {
      toast({ variant: "destructive", title: texts.loadError, description: "請檢查檔案格式並重試" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddText = () => {
    if(activePageIndex === null) return;
    const newAnnotation: TextAnnotation = {
      id: uuidv4(),
      type: 'text',
      pageIndex: activePageIndex,
      segments: [{ text: '輸入文字', color: '#000000', bold: false, italic: false, underline: false }],
      topRatio: 0.5,
      leftRatio: 0.5,
      widthRatio: 0.2,
      heightRatio: 0.05,
      fontSize: 12,
      fontFamily: 'Helvetica',
      textAlign: 'left',
      isUserAction: true,
    };
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotationId(newAnnotation.id);
    setInteractionMode('editing');
    saveStateToHistory();
  };

  const renderPage = (pageObj: PageObject, index: number) => {
    return (
      <div 
        key={pageObj.id} 
        ref={el => pageRefs.current[index] = el}
        className="relative mx-auto border shadow-lg page-canvas"
        style={{
          width: pageObj.sourceCanvas.width * mainCanvasZoom,
          height: pageObj.sourceCanvas.height * mainCanvasZoom,
        }}
        onClick={(e) => handleCanvasClick(e)}
      >
        <canvas
          ref={canvas => {
            if(canvas) {
              const ctx = canvas.getContext('2d');
              if(!ctx) return;
              canvas.width = pageObj.sourceCanvas.width;
              canvas.height = pageObj.sourceCanvas.height;
              ctx.drawImage(pageObj.sourceCanvas, 0, 0);
            }
          }}
          style={{ width: '100%', height: '100%' }}
        />
        {annotations
          .filter(ann => ann.pageIndex === index)
          .map(ann => (
            <TextAnnotationComponent
              key={ann.id}
              annotation={ann}
              mainCanvasZoom={mainCanvasZoom}
              isSelected={selectedAnnotationId === ann.id}
              isEditing={selectedAnnotationId === ann.id && interactionMode === 'editing'}
              isHovered={hoveredAnnotationId === ann.id}
              onAnnotationChange={onAnnotationChange}
              onSelect={onSelectAnnotation}
              onEdit={onEditAnnotation}
              onDragStart={onDragStart}
              onResizeStart={onResizeStart}
              onHover={onHoverAnnotation}
            />
          ))}
      </div>
    );
  };
  
  const activeAnnotation = annotations.find(ann => ann.id === selectedAnnotationId);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="p-4 border-b bg-card flex justify-between items-center">
        <h1 className="text-2xl font-bold">{texts.pageTitle}</h1>
        <div>
           <Input type="file" accept="application/pdf" onChange={handleFileUpload} disabled={isLoading} className="w-auto" />
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-20 p-2 border-r bg-card flex flex-col items-center space-y-4">
            <Button
              onClick={() => setActiveTool(tool => tool === 'select' ? 'text' : 'select')}
              variant={activeTool === 'select' ? 'secondary' : 'ghost'}
              size="icon"
            >
              {texts.toolSelect[0]}
            </Button>
            <Button
              onClick={handleAddText}
              variant={activeTool === 'text' ? 'secondary' : 'ghost'}
              size="icon"
              disabled={pageObjects.length === 0}
            >
              {texts.toolText[0]}
            </Button>
        </aside>
        <main className="flex-1 flex flex-col p-4 overflow-auto">
          {activeAnnotation && interactionMode === 'editing' && (
            <div className="mb-4">
              <TextAnnotationToolbar
                annotation={activeAnnotation as TextAnnotation}
                onAnnotationChange={onAnnotationChange}
                onDelete={onDeleteAnnotation}
              />
            </div>
          )}
          <div className="flex-1 space-y-4">
            {pageObjects.length > 0 ? (
              pageObjects.map((page, index) => renderPage(page, index))
            ) : (
              <div className="text-center text-muted-foreground pt-10">{texts.uploadLabel}</div>
            )}
          </div>
        </main>
        <aside className="w-64 p-4 border-l bg-card overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">動作歷史</h3>
            <div className="space-y-2">
              {annotations
                .filter(ann => ann.isUserAction)
                .map((ann) => (
                  <div
                    key={ann.id}
                    className={cn(
                      "p-2 rounded-md border text-sm cursor-pointer hover:bg-muted/50",
                      selectedAnnotationId === ann.id && "bg-primary/10 border-primary"
                    )}
                    onClick={() => setSelectedAnnotationId(ann.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate pr-2">
                        {ann.type === 'text' ? (ann as TextAnnotation).segments.map(s => s.text).join('').substring(0, 20) : ann.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnnotation(ann.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              {annotations.filter(ann => ann.isUserAction).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No actions yet.</p>
              )}
            </div>
        </aside>
      </div>
    </div>
  );
}

