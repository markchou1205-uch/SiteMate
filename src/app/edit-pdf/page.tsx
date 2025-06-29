
"use client";

import { useEffect, useRef, useState } from "react";
import { Toolbar } from "./components/toolbar";
import PropertyPanel from "./components/PropertyPanel";
import InteractivePdfCanvas from "./components/InteractivePdfCanvas";
import PageThumbnailList from "./components/PageThumbnailList";
import ZoomControls from "./components/ZoomControls";

export default function Page() {
  const [isEditingText, setIsEditingText] = useState(false);
  const [selectedTextStyle, setSelectedTextStyle] = useState({
    bold: false,
    italic: false,
    underline: false,
    color: "#000000",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pageObjects, setPageObjects] = useState<any[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const handleStyleChange = (styleUpdate: Partial<typeof selectedTextStyle>) => {
    setSelectedTextStyle((prev) => ({ ...prev, ...styleUpdate }));
  };

  const handleClickCanvas = () => {
    setIsEditingText(false);
    setSelectedObjectId(null);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.2));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <Toolbar 
        selectedTextObject={!!selectedObjectId}
        style={selectedTextStyle}
        onTextStyleChange={handleStyleChange}
        onNewFile={() => document.getElementById('pdf-upload')?.click()}
        onUpload={() => document.getElementById('pdf-upload')?.click()}
      />
      <input type="file" id="pdf-upload" className="hidden" onChange={handleFileChange} accept="application/pdf" />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 relative" onClick={handleClickCanvas}>
          <div className="absolute left-0 top-0 w-36 h-full border-r overflow-y-auto bg-white z-10">
            <PageThumbnailList
              numPages={numPages}
              currentPage={currentPage}
              onSelectPage={setCurrentPage}
            />
          </div>

          <div className="ml-36 h-full overflow-auto">
            <InteractivePdfCanvas
              pdfFile={pdfFile}
              setNumPages={setNumPages}
              // The props below are for editor functionality not yet implemented in the component,
              // but are added to the interface to prevent build errors.
              currentPage={currentPage}
              scale={scale}
              onTextEditStart={() => setIsEditingText(true)}
              onTextEditEnd={() => setIsEditingText(false)}
              selectedStyle={selectedTextStyle}
              selectedObjectId={selectedObjectId}
              setSelectedObjectId={setSelectedObjectId}
              pageObjects={pageObjects}
              setPageObjects={setPageObjects}
              setPdfLoaded={setPdfLoaded}
            />
          </div>

          <ZoomControls scale={scale} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />

          <PropertyPanel
            isVisible={isEditingText}
            onClose={() => setIsEditingText(false)}
            currentStyle={selectedTextStyle}
            onStyleChange={handleStyleChange}
          />
        </main>
      </div>
    </div>
  );
}
