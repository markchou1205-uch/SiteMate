"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { FaMousePointer, FaFont, FaPen, FaSquare, FaPalette } from "react-icons/fa";

type Tool = "select" | "text" | "draw" | "rect";

const colors = ["#000000", "#FF0000", "#008000", "#0000FF", "#FFA500", "#800080"];
interface ToolbarProps {
  currentTool: Tool;
  setTool: (tool: Tool) => void;
  color: string;
  setColor: (color: string) => void;
  onExport: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ currentTool, setTool, color, setColor, onExport }) => {
  return (
    <div className="flex gap-2 p-2 bg-gray-100 border-b border-gray-300">
      <button
        onClick={() => setTool("select")}
        className={`p-2 rounded ${currentTool === "select" ? "bg-blue-200" : "bg-white"}`}
      >
        <FaMousePointer />
      </button>
      <button
        onClick={() => setTool("text")}
        className={`p-2 rounded ${currentTool === "text" ? "bg-blue-200" : "bg-white"}`}
      >
        <FaFont />
      </button>
      <button
        onClick={() => setTool("draw")}
        className={`p-2 rounded ${currentTool === "draw" ? "bg-blue-200" : "bg-white"}`}
      >
        <FaPen />
      </button>
      <button
        onClick={() => setTool("rect")}
        className={`p-2 rounded ${currentTool === "rect" ? "bg-blue-200" : "bg-white"}`}
      >
        <FaSquare />
      </button>

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
      <div className="ml-auto flex gap-2">
  <button onClick={onExport} className="px-2 py-1 bg-green-500 text-white rounded">
    下載 PDF
  </button>
</div>

    </div>
    
  );
};

export default Toolbar;
