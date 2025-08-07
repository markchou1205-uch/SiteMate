"use client";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import React from 'react';

const Logo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Image 
        src="/img/wujipdflogo.png" 
        alt="WujiPDF Logo"
        width={150}
        height={40}
        priority
        className="w-auto"
        style={{ height: 'auto' }}
      />
    </div>
  );
};
export default Logo;
