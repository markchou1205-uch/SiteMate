
import { PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { EditableObject, ShapeObject, TextObject, ImageObject, Annotation, WatermarkObject, PageViewport } from './types';

export async function drawObject(
    page: PDFPage,
    obj: EditableObject,
    pageViewport: PageViewport,
): Promise<void> {
  switch (obj.type) {
    case 'text':
      await drawText(page, obj, pageViewport);
      break;
    case 'image':
      await drawImage(page, obj, pageViewport);
      break;
    case 'shape':
      await drawShape(page, obj, pageViewport);
      break;
    // Add cases for other object types like 'watermark', 'annotation' if needed
  }
}

async function drawText(page: PDFPage, obj: TextObject, pageViewport: PageViewport) {
  const { x, y, text, fontSize, color, rotation = 0 } = obj;
  const pdfDoc = page.doc;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  page.drawText(text, {
    x: x,
    y: page.getHeight() - y - fontSize, // pdf-lib draws from bottom-left
    font,
    size: fontSize,
    color: hexToRgb(color),
    rotate: { angle: -rotation, type: 'degrees' },
  });
}

async function drawImage(page: PDFPage, obj: ImageObject, pageViewport: PageViewport) {
    const { x, y, width, height, dataUrl, rotation = 0 } = obj;
    const pdfDoc = page.doc;
    
    let image;
    if(dataUrl.startsWith('data:image/png')) {
        image = await pdfDoc.embedPng(dataUrl);
    } else if (dataUrl.startsWith('data:image/jpeg')) {
        image = await pdfDoc.embedJpg(dataUrl);
    } else {
        console.error("Unsupported image format for embedding");
        return;
    }

    page.drawImage(image, {
        x: x,
        y: page.getHeight() - y - height,
        width: width,
        height: height,
        rotate: { angle: -rotation, type: 'degrees' },
    });
}


async function drawShape(page: PDFPage, obj: ShapeObject, pageViewport: PageViewport) {
  const { x, y, width, height, shapeType, color, strokeWidth, rotation = 0 } = obj;
  const { r, g, b } = hexToRgb(color);
  
  const centerX = x + width / 2;
  const centerY = page.getHeight() - (y + height / 2);

  page.pushGraphicsState();
  page.translate(centerX, centerY);
  page.rotateDegrees(-rotation);
  page.translate(-centerX, -centerY);

  if (shapeType === 'rectangle') {
    page.drawRectangle({
      x: x,
      y: page.getHeight() - y - height,
      width,
      height,
      borderColor: rgb(r, g, b),
      borderWidth: strokeWidth,
    });
  } else if (shapeType === 'ellipse') {
      page.drawEllipse({
        x: x + width/2,
        y: page.getHeight() - y - height/2,
        xScale: width/2,
        yScale: height/2,
        borderColor: rgb(r, g, b),
        borderWidth: strokeWidth,
      })
  } else if (shapeType === 'line') {
      page.drawLine({
          start: {x, y: page.getHeight() - y},
          end: {x: x + width, y: page.getHeight() - (y + height)},
          color: rgb(r,g,b),
          thickness: strokeWidth,
      })
  }
  
  page.popGraphicsState();
}

// Helper to convert hex color string to RGB object for pdf-lib
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0, g: 0, b: 0 }; // Default to black if format is wrong
}
