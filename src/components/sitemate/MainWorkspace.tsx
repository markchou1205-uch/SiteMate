
"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Code, Palette, GripVertical, PlusCircle, Image as ImageIcon, Type } from "lucide-react";
import Image from "next/image";

interface MainWorkspaceProps {
  previewMode: "desktop" | "mobile";
  currentPageTitle?: string;
}

const MainWorkspace: React.FC<MainWorkspaceProps> = ({ previewMode, currentPageTitle = "Home Page" }) => {
  const isMobilePreview = previewMode === "mobile";

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-background flex space-x-6">
      {/* Visual Editor Tools Panel (Simplified) */}
      <div className="w-20 bg-card p-3 rounded-lg shadow-md flex flex-col items-center space-y-3">
        <Button variant="ghost" size="icon" className="h-10 w-10" title="Add Section">
          <PlusCircle className="h-5 w-5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" title="Add Text">
          <Type className="h-5 w-5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" title="Add Image">
          <ImageIcon className="h-5 w-5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" title="Customize Style">
          <Palette className="h-5 w-5 text-primary" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" title="Drag Handle (placeholder)">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      
      {/* Visual Editor & Preview Area */}
      <div className="flex-1 flex flex-col items-center">
        <Card className="w-full max-w-5xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="font-headline">{currentPageTitle} - Editor</CardTitle>
              <CardDescription>Drag and drop elements to build your page.</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/> Preview</Button>
              <Button variant="outline" size="sm"><Code className="mr-2 h-4 w-4"/> Code</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div 
              className="mx-auto bg-white shadow-lg rounded-md transition-all duration-300 ease-in-out"
              style={{ 
                width: isMobilePreview ? "375px" : "100%", 
                height: isMobilePreview ? "667px" : "calc(100vh - 200px)",
                minHeight: "400px",
                border: "1px solid hsl(var(--border))",
                overflow: "hidden", // Simulates viewport
              }}
              aria-label={`Preview of ${currentPageTitle} in ${previewMode} mode`}
            >
              {/* Placeholder content for Visual Editor */}
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-muted rounded-md relative overflow-hidden">
                 <Image 
                    src={`https://placehold.co/800x600.png`} 
                    alt="Website placeholder" 
                    layout="fill"
                    objectFit="cover"
                    className="opacity-20"
                    data-ai-hint="website abstract"
                  />
                <div className="z-10 text-center">
                  <Palette className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2 font-headline">Visual Editor Area</h3>
                  <p className="text-muted-foreground">
                    This is where you&apos;ll design your <span className="font-semibold text-primary">{currentPageTitle}</span>.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current preview: <span className="font-medium">{previewMode}</span>
                  </p>
                  <Button variant="default" size="sm" className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Element
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default MainWorkspace;
