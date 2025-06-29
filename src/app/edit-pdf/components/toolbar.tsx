
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
    <div className="flex items-center justify-between border-b bg-secondary p-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onNewFile}><FilePlus className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onUpload}><Upload className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onDownload}><Download className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onErase}><Eraser className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onAddRect}><Circle className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onAddFreeDraw}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={onAddText}><Text className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
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
