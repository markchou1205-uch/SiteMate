// src/hooks/useTextTool.ts
import { fabric } from 'fabric';
import { useEffect, useRef } from 'react';

export default function useTextTool(canvasRef: React.RefObject<fabric.Canvas | null>) {
  const selectedColorRef = useRef('black');

  // Insert text tool (using IText for selection support)
  const insertTextBox = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const textbox = new fabric.IText('請輸入文字', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: selectedColorRef.current,
      fontFamily: 'Arial',
      padding: 5,
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    textbox.enterEditing();
    canvas.renderAll();
  };

  // Apply style (bold, italic, underline) to selected text
  const applyStyle = (styleKey: string, value: any) => {
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject() as fabric.IText;
    if (obj && obj.isEditing && obj.selectionStart !== obj.selectionEnd) {
      obj.setSelectionStyles({ [styleKey]: value });
      canvas.renderAll();
    }
  };

  // Apply color
  const setColor = (color: string) => {
    selectedColorRef.current = color;
    const canvas = canvasRef.current;
    const obj = canvas?.getActiveObject() as fabric.IText;
    if (obj && obj.isEditing && obj.selectionStart !== obj.selectionEnd) {
      obj.setSelectionStyles({ fill: color });
      canvas.renderAll();
    } else if (obj) {
      obj.set({ fill: color });
      canvas.renderAll();
    }
  };

  // Toolbar control (requires DOM toolbar to be designed separately)
  const showToolbar = () => {
    const toolbar = document.getElementById('text-toolbar');
    if (toolbar) toolbar.style.display = 'flex';
  };

  const hideToolbar = () => {
    const toolbar = document.getElementById('text-toolbar');
    if (toolbar) toolbar.style.display = 'none';
  };

  // Bind events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: fabric.IEvent) => {
      if (!e.target) {
        canvas.discardActiveObject();
        canvas.renderAll();
      }
    };
    
    const onSelectionCleared = () => {
        hideToolbar();
    }
    
    const onSelectionCreated = (e: fabric.IEvent) => {
        if (e.selected && e.selected[0].type === 'i-text') {
            showToolbar();
        }
    }
    
    const onObjectModified = () => {
        // can be used for history/state saving
    }

    canvas.on('mouse:down', onMouseDown);
    canvas.on('selection:created', onSelectionCreated);
    canvas.on('selection:updated', onSelectionCreated);
    canvas.on('selection:cleared', onSelectionCleared);
    canvas.on('object:modified', onObjectModified);

    return () => {
      canvas.off('mouse:down', onMouseDown);
      canvas.off('selection:created', onSelectionCreated);
      canvas.off('selection:updated', onSelectionCreated);
      canvas.off('selection:cleared', onSelectionCleared);
      canvas.off('object:modified', onObjectModified);
    };
  }, [canvasRef]);

  return {
    insertTextBox,
    applyStyle,
    setColor,
  };
}
