// 檔案：Toolbar.tsx
import { FilePlus, Download, Upload, Eraser, Circle, Pencil, Text, Trash2, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function Toolbar({
  onAddText,
  onAddRect,
  onAddFreeDraw,
  onErase,
  onUpload,
  onNewFile,
  onDownloadRequest,
  onDeleteObject,
}: any) {

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1 text-center">
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onNewFile}><FilePlus className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">新增檔案</span>
        </div>
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onUpload}><Upload className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">上傳</span>
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
            <Button variant="ghost" size="icon" onClick={onDeleteObject}><Trash2 className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">刪除物件</span>
        </div>
      </div>

       <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="destructive">
                <Download className="h-4 w-4 mr-2" />
                下載
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuLabel>下載格式</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDownloadRequest('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF 文件</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadRequest('word')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Word 文件 (.docx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadRequest('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Excel 試算表 (.xlsx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadRequest('ppt')}>
                <LucidePresentation className="mr-2 h-4 w-4" />
                <span>PowerPoint 簡報 (.pptx)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadRequest('html')}>
                <Code className="mr-2 h-4 w-4" />
                <span>HTML 文件 (.html)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownloadRequest('jpg')}>
                <FileImage className="mr-2 h-4 w-4" />
                <span>圖片 (JPG)</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}