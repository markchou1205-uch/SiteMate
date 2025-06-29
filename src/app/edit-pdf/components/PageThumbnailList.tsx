import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PageThumbnailListProps {
  numPages: number;
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

const PageThumbnailList: React.FC<PageThumbnailListProps> = ({
  numPages,
  currentPage,
  onSelectPage,
}) => {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-2">
        {Array.from({ length: numPages }, (_, i) => (
          <Button
            key={i + 1}
            variant="outline"
            className={cn(
              "h-24 w-full justify-center",
              currentPage === i + 1 && "border-2 border-primary"
            )}
            onClick={() => onSelectPage(i + 1)}
          >
            Page {i + 1}
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
};

export default PageThumbnailList;
