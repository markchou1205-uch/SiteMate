import { fabric } from "fabric";
import jsPDF from "jspdf";

// 將 fabric 畫布轉為 PDF 並下載
export const exportCanvasAsPdf = (canvas: fabric.Canvas, filename = "edited.pdf") => {
  const dataUrl = canvas.toDataURL({ format: "png" });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [canvas.getWidth(), canvas.getHeight()],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, canvas.getWidth(), canvas.getHeight());
  pdf.save(filename);
};
