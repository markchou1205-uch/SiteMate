
"use client";

import React, { useEffect, useState, useRef } from "react";
import type { fabric } from "fabric";
import { Bold, Italic, Underline, Strikethrough, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TextToolbarProps {
  activeObject: fabric.Object | null;
  editorRef: React.RefObject<HTMLDivElement>;
}

const TextToolbar: React.FC<TextToolbarProps> = ({ activeObject, editorRef }) => {
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({});
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  const textObject = activeObject?.type === 'i-text' && activeObject.isEditing ? activeObject as fabric.IText : null;

  const [fontSize, setFontSize] = useState<number>(20);
  const [fill, setFill] = useState<string>('#000000');
  const [styles, setStyles] = useState<{ [key: string]: boolean }>({
    bold: false,
    italic: false,
    underline: false,
    linethrough: false,
  });

  useEffect(() => {
      const currentTextObject = activeObject as fabric.IText;
      if (currentTextObject && currentTextObject.type === 'i-text') {
          setFontSize(currentTextObject.fontSize || 20);
          setFill((currentTextObject.fill as string) || '#000000');
          setStyles({
              bold: currentTextObject.fontWeight === 'bold',
              italic: currentTextObject.fontStyle === 'italic',
              underline: !!currentTextObject.underline,
              linethrough: !!currentTextObject.linethrough,
          });
      }
  }, [activeObject]);

  const updateStyle = (style: string, value?: any) => {
    if (!textObject) return;
    const canvas = textObject.canvas;

    switch (style) {
      case "bold":
        textObject.set("fontWeight", styles.bold ? "normal" : "bold");
        setStyles(s => ({ ...s, bold: !s.bold }));
        break;
      case "italic":
        textObject.set("fontStyle", styles.italic ? "normal" : "italic");
        setStyles(s => ({ ...s, italic: !s.italic }));
        break;
      case "underline":
        textObject.set("underline", !styles.underline);
        setStyles(s => ({ ...s, underline: !s.underline }));
        break;
      case "linethrough":
        textObject.set("linethrough", !styles.linethrough);
        setStyles(s => ({ ...s, linethrough: !s.linethrough }));
        break;
      case "fontSize":
        textObject.set("fontSize", parseInt(value, 10));
        setFontSize(parseInt(value, 10));
        break;
      case "fill":
        textObject.set("fill", value);
        setFill(value);
        break;
    }
    canvas?.requestRenderAll();
  };

  useEffect(() => {
    if (textObject && editorRef.current && toolbarRef.current) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const canvas = textObject.canvas;
      if (!canvas) return;

      const zoom = canvas.getZoom();
      const canvasEl = canvas.getElement();
      const canvasOffset = canvasEl.getBoundingClientRect();
      const objBoundingRect = textObject.getBoundingRect();

      let top = canvasOffset.top + (objBoundingRect.top + objBoundingRect.height) * zoom + 10;
      let left = canvasOffset.left + objBoundingRect.left * zoom;

      const toolbarWidth = toolbarRef.current.offsetWidth;
      if (left + toolbarWidth > editorRect.right) {
        left = editorRect.right - toolbarWidth - 10;
      }
       if (left < editorRect.left) {
        left = editorRect.left + 10;
      }
      
      const toolbarHeight = toolbarRef.current.offsetHeight;
      if (top + toolbarHeight > editorRect.bottom) {
        top = canvasOffset.top + objBoundingRect.top * zoom - toolbarHeight - 10;
      }


      setToolbarStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
        transform: 'none',
      });
    } else {
        setToolbarStyle({ opacity: 0, pointerEvents: 'none' });
    }
  }, [textObject, editorRef]);
  
  if (!textObject) {
    return null;
  }
  
  return (
    <div
      ref={toolbarRef}
      style={toolbarStyle}
      className="bg-card p-2 rounded-lg shadow-lg border flex items-center gap-4 transition-opacity z-30"
      onMouseDown={(e) => e.stopPropagation()} 
    >
        <div className="flex items-center gap-2">
            <Label htmlFor="font-size" className="text-sm">大小</Label>
            <Input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => updateStyle("fontSize", e.target.value)}
                className="w-16 h-8"
            />
        </div>

        <ToggleGroup type="multiple" value={Object.keys(styles).filter(k => styles[k])} onValueChange={(value) => {
            const newStyles = { bold: value.includes('bold'), italic: value.includes('italic'), underline: value.includes('underline'), linethrough: value.includes('linethrough') };
            if (newStyles.bold !== styles.bold) updateStyle('bold');
            if (newStyles.italic !== styles.italic) updateStyle('italic');
            if (newStyles.underline !== styles.underline) updateStyle('underline');
            if (newStyles.linethrough !== styles.linethrough) updateStyle('linethrough');
        }}>
            <ToggleGroupItem value="bold" aria-label="Toggle bold"><Bold className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic"><Italic className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Toggle underline"><Underline className="h-4 w-4" /></ToggleGroupItem>
            <ToggleGroupItem value="linethrough" aria-label="Toggle strikethrough"><Strikethrough className="h-4 w-4" /></ToggleGroupItem>
        </ToggleGroup>
        
         <div className="flex items-center gap-2">
            <Label htmlFor="color-picker" className="sr-only">顏色</Label>
            <Button variant="ghost" size="icon" className="h-8 w-8 relative" onClick={() => document.getElementById('color-picker-input')?.click()}>
                <Palette className="h-4 w-4" />
                 <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-card" style={{backgroundColor: fill}} />
            </Button>
            <input 
                id="color-picker-input"
                type="color" 
                value={fill} 
                onChange={(e) => updateStyle('fill', e.target.value)} 
                className="sr-only"
            />
        </div>
    </div>
  );
};

export default TextToolbar;
