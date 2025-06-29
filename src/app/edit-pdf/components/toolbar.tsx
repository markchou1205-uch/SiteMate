
// 檔案：Toolbar.tsx
import { FilePlus, Download, Upload, Eraser, Circle, Pencil, Text, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Toolbar({
  onAddText,
  onAddRect,
  onAddFreeDraw,
  onErase,
  onUpload,
  onDownload,
  onNewFile,
  selectedTextObject,
  style,
  onTextStyleChange,
}: any) {
  const setStyle = onTextStyleChange;

  return (
    <div className="relative z-20 flex items-center justify-between border-b bg-secondary p-2 shadow-md">
      <div className="flex items-center gap-4 text-center">
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onNewFile}><FilePlus className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">新增檔案</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onUpload}><Upload className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">上傳</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onDownload}><Download className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">下載</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onErase}><Eraser className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">橡皮擦</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onAddRect}><Circle className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">新增圖形</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onAddFreeDraw}><Pencil className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">畫筆</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onAddText}><Text className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">文字</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon"><Trash2 className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">刪除物件</span>
        </div>
      </div>

      {selectedTextObject && style && (
        <div className="flex items-center gap-2">
          <Button variant={style.bold ? "default" : "ghost"} size="icon" onClick={() => setStyle({ bold: !style.bold })}><b>B</b></Button>
          <Button variant={style.italic ? "default" : "ghost"} size="icon" onClick={() => setStyle({ italic: !style.italic })}><i>I</i></Button>
          <Button variant={style.underline ? "default" : "ghost"} size="icon" onClick={() => setStyle({ underline: !style.underline })}><u>U</u></Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" style={{ backgroundColor: style.color || "black" }} />
            </PopoverTrigger>
            <PopoverContent className="w-40">
              <input
                type="color"
                className="w-full h-8 border rounded"
                value={style.color || "#000000"}
                onChange={(e) => setStyle({ color: e.target.value })}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
