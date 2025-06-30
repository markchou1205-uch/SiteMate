
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
  
  const textObject = activeObject?.type === 'i-text' ? activeObject as fabric.IText : null;

  const [fontSize, setFontSize] = useState<number>(() => textObject?.fontSize || 20);
  const [fill, setFill] = useState<string>(() => (textObject?.fill as string) || '#000000');
  const [styles, setStyles] = useState<{ [key: string]: boolean }>({
    bold: textObject?.fontWeight === 'bold',
    italic: textObject?.fontStyle === 'italic',
    underline: !!textObject?.underline,
    linethrough: !!textObject?.linethrough,
  });

  useEffect(() => {
      if (textObject) {
          setFontSize(textObject.fontSize || 20);
          setFill((textObject.fill as string) || '#000000');
          setStyles({
              bold: textObject.fontWeight === 'bold',
              italic: textObject.fontStyle === 'italic',
              underline: !!textObject.underline,
              linethrough: !!textObject.linethrough,
          });
      }
  }, [textObject]);

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
    if (activeObject && editorRef.current && toolbarRef.current) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const objRect = activeObject.getBoundingRect();
      const canvas = activeObject.canvas;
      if (!canvas) return;

      const zoom = canvas.getZoom();
      const canvasOffset = canvas.getElement().getBoundingClientRect();

      let top = canvasOffset.top + (objRect.top + objRect.height) * zoom + 10 - editorRect.top;
      let left = canvasOffset.left + objRect.left * zoom - editorRect.left;

      // Adjust if toolbar would go off-screen
      const toolbarWidth = toolbarRef.current.offsetWidth;
      if (left + toolbarWidth > editorRect.width) {
        left = editorRect.width - toolbarWidth - 10;
      }
       if (left < 0) {
        left = 10;
      }
      
      const toolbarHeight = toolbarRef.current.offsetHeight;
      if (top + toolbarHeight > editorRect.height) {
        top = canvasOffset.top + objRect.top * zoom - toolbarHeight - 10 - editorRect.top;
      }


      setToolbarStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        opacity: 1,
      });
    } else {
        setToolbarStyle({ opacity: 0, pointerEvents: 'none' });
    }
  }, [activeObject, editorRef]);
  
  if (!textObject) {
    return null;
  }
  
  return (
    <div
      ref={toolbarRef}
      style={toolbarStyle}
      className="bg-card p-2 rounded-lg shadow-lg border flex items-center gap-4 transition-opacity z-30"
      onMouseDown={(e) => e.stopPropagation()} // Prevent editor pan/move
    >
        <div className="flex items-center gap-2">
            <Label htmlFor="font-size" className="text-sm">Size</Label>
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
            <Label htmlFor="color-picker" className="sr-only">Color</Label>
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
