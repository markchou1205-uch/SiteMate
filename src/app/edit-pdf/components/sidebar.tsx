"use client";

import React from "react";
import Image from "next/image";

interface SidebarProps {
  pages: string[];
  currentPage: number;
  onPageSelect: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ pages, currentPage, onPageSelect }) => {
  return (
    <div className="w-28 bg-muted overflow-y-auto border-r border-gray-300">
      {pages.map((thumbnail, index) => (
        <div
          key={index}
          className={`cursor-pointer p-1 border-b border-gray-200 hover:bg-gray-100 ${
            currentPage === index ? "bg-gray-300" : ""
          }`}
          onClick={() => onPageSelect(index)}
        >
          <Image
            src={thumbnail}
            alt={`Page ${index + 1}`}
            width={100}
            height={130}
            className="rounded shadow-sm"
          />
          <div className="text-center text-xs text-muted-foreground mt-1">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
