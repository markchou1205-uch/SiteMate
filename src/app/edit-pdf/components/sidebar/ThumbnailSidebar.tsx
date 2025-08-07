// src/app/edit-pdf/components/sidebar/ThumbnailSidebar.tsx
"use client";

import React from 'react';
import { useInView } from 'react-intersection-observer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { PageInfo } from '../../lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ThumbnailSidebarProps {
  pages: PageInfo[];
  currentPage: number;
  onPageChange: (pageNumber: number) => void;
  onReorderPages: (oldIndex: number, newIndex: number) => void;
  onThumbnailInView: (id: string) => void;
}

const Thumbnail = React.memo(({
  page,
  index,
  isActive,
  onClick,
  onInView,
}: {
  page: PageInfo;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onInView: (id: string) => void;
}) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px', // Pre-load thumbnails that are close to the viewport
  });

  React.useEffect(() => {
    if (inView) {
      onInView(page.id);
    }
  }, [inView, page.id, onInView]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'p-2 cursor-pointer transition-all duration-200 rounded-lg border-2',
        isActive ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted'
      )}
    >
      <div className="relative w-full aspect-[1/1.414] bg-white rounded-md shadow-md overflow-hidden">
        {page.thumbnailUrl && page.thumbnailUrl !== 'error' ? (
          <img src={page.thumbnailUrl} alt={`Page ${index + 1}`} className="w-full h-full object-contain" />
        ) : page.thumbnailUrl === 'error' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-destructive/10 text-destructive text-center p-1">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-xs mt-1">Error</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      <p className="text-center text-xs mt-1.5 font-medium text-muted-foreground">{index + 1}</p>
    </div>
  );
});
Thumbnail.displayName = 'Thumbnail';


export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPage,
  onPageChange,
  onThumbnailInView,
  // onReorderPages, // Drag-and-drop reordering can be added here
}) => {
    const activeThumbnailRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (activeThumbnailRef.current) {
            activeThumbnailRef.current.scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
            });
        }
    }, [currentPage]);


  return (
    <aside className="w-56 bg-card border-r flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Pages</h2>
        <p className="text-sm text-muted-foreground">{pages.length} pages total</p>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {pages.map((page, index) => (
             <div key={page.id} ref={index + 1 === currentPage ? activeThumbnailRef : null}>
                <Thumbnail
                    page={page}
                    index={index}
                    isActive={index + 1 === currentPage}
                    onClick={() => onPageChange(index + 1)}
                    onInView={onThumbnailInView}
                />
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
