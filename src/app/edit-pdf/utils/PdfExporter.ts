import type { Canvas } from "fabric";  // 👈 用 type 避免 runtime 匯入未使用
import jsPDF from "jspdf";

// 將 fabric 畫布轉為 PDF 並下載
export const exportCanvasAsPdf = (canvas: Canvas, filename = "edited.pdf") => {
  const dataUrl = canvas.toDataURL({
    format: "png",
    multiplier: 2, // ✅ 修正必要參數 (fabric v6 需要指定)
  });

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [canvas.getWidth(), canvas.getHeight()],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, canvas.getWidth(), canvas.getHeight());
  pdf.save(filename);
};

