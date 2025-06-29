// 檔案：Toolbar.tsx
import { FilePlus, Download, Upload, Circle, Pencil, Text, Trash2, FileText, FileSpreadsheet, LucidePresentation, Code, FileImage, Square, Triangle, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export function Toolbar({
  onAddText,
  onSetDrawingTool,
  onOpenFileRequest,
  onInsertPdfRequest,
  onDeleteObject,
  onDownloadRequest,
}: any) {

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-1 text-center">
        <div className="flex flex-col items-center w-16">
            <Button variant="ghost" size="icon" onClick={onOpenFileRequest}><FilePlus className="h-5 w-5" /></Button>
            <span className="text-xs mt-1">開啟檔案</span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center w-16 cursor-pointer">
                    <Button variant="ghost" size="icon"><Upload className="h-5 w-5" /></Button>
                    <span className="text-xs mt-1">插入文件</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onInsertPdfRequest('start')}>
                    <span>插入至開頭</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInsertPdfRequest('before')}>
                    <span>插入至所選頁面前</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInsertPdfRequest('after')}>
                    <span>插入至所選頁面後</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onInsertPdfRequest('end')}>
                    <span>插入至結尾</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
             <DropdownMenuTrigger asChild>
                <div className="flex flex-col items-center w-16 cursor-pointer">
                    <Button variant="ghost" size="icon"><Circle className="h-5 w-5" /></Button>
                    <span className="text-xs mt-1">新增圖形</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onSetDrawingTool('rect')}>
                    <Square className="mr-2 h-4 w-4" />
                    <span>方形</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSetDrawingTool('circle')}>
                    <Circle className="mr-2 h-4 w-4" />
                    <span>圓形</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => onSetDrawingTool('triangle')}>
                    <Triangle className="mr-2 h-4 w-4" />
                    <span>三角形</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onSetDrawingTool('freedraw')}>
                    <Pen className="mr-2 h-4 w-4" />
                    <span>畫筆</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

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
            <Button variant="destructive" size="lg">
                <Download className="h-4 w-4 mr-2" />
                下載成各種格式
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
