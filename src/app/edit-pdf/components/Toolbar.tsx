"use client";

import React from "react";
import Sidebar from "./Sidebar";
import {
  FaMousePointer,
  FaFont,
  FaPen,
  FaSquare,
  FaPalette,
  FaShapes,
  FaUndo,
  FaRedo,
  FaImage,
  FaSignature,
  FaEyeSlash,
  FaDownload,
  FaBold,
  FaItalic,
  FaUnderline,
  FaTextHeight,
  FaBorderAll,
} from "react-icons/fa";

import { TbRectangle, TbCircle, TbTriangle } from "react-icons/tb";
import { MdOutlineInsertPhoto } from "react-icons/md";
import { BiSolidMosaic } from "react-icons/bi";
import { IoMdText } from "react-icons/io";
import { RiFontSize2 } from "react-icons/ri";

// 工具列功能類型
export type Tool =
  | "select"
  | "text"
  | "draw"
  | "rect"
  | "signature"
  | "mosaic"
  | "image"
  | "shape";

const colors = ["#000000", "#FF0000", "#008000", "#0000FF", "#FFA500", "#800080"];

interface ToolbarProps {
  currentTool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onUploadImage: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setTool,
  color,
  setColor,
  onExport,
  onUndo,
  onRedo,
  onUploadImage,
}) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-100 border-b border-gray-300 items-center">
      <button onClick={() => setTool("select")} className={`p-2 rounded ${currentTool === "select" ? "bg-blue-200" : "bg-white"}`}><FaMousePointer /></button>
      <button onClick={() => setTool("text")} className={`p-2 rounded ${currentTool === "text" ? "bg-blue-200" : "bg-white"}`}><IoMdText /></button>
      <button onClick={() => setTool("draw")} className={`p-2 rounded ${currentTool === "draw" ? "bg-blue-200" : "bg-white"}`}><FaPen /></button>
      <button onClick={() => setTool("shape")} className={`p-2 rounded ${currentTool === "shape" ? "bg-blue-200" : "bg-white"}`}><FaShapes /></button>
      <button onClick={() => setTool("signature")} className={`p-2 rounded ${currentTool === "signature" ? "bg-blue-200" : "bg-white"}`}><FaSignature /></button>
      <button onClick={() => setTool("mosaic")} className={`p-2 rounded ${currentTool === "mosaic" ? "bg-blue-200" : "bg-white"}`}><BiSolidMosaic /></button>
      <button onClick={onUploadImage} className={`p-2 rounded ${currentTool === "image" ? "bg-blue-200" : "bg-white"}`}><MdOutlineInsertPhoto /></button>

      {/* 顏色選擇器 */}
      <div className="flex items-center ml-4 gap-1">
        <FaPalette />
        {colors.map((c) => (
          <div
            key={c}
            className={`w-5 h-5 rounded-full cursor-pointer border ${color === c ? "border-black" : "border-gray-300"}`}
            style={{ backgroundColor: c }}
            onClick={() => setColor(c)}
          />
        ))}
      </div>

      {/* 浮動編輯工具列（樣式） */}
      <div className="flex items-center gap-2 ml-4">
        <FaBold className="cursor-pointer" title="粗體" />
        <FaItalic className="cursor-pointer" title="斜體" />
        <FaUnderline className="cursor-pointer" title="底線" />
        <RiFontSize2 className="cursor-pointer" title="字型大小" />
        <FaBorderAll className="cursor-pointer" title="邊框粗細" />
      </div>

      {/* 功能按鈕區 */}
      <div className="ml-auto flex gap-2">
        <button onClick={onUndo} className="p-2 bg-gray-200 rounded" title="復原"><FaUndo /></button>
        <button onClick={onRedo} className="p-2 bg-gray-200 rounded" title="重做"><FaRedo /></button>
        <button onClick={onExport} className="px-2 py-1 bg-green-500 text-white rounded" title="下載 PDF">
          <FaDownload className="inline mr-1" />下載 PDF
        </button>
      </div>
    </div>
  );
};

export default Toolbar;