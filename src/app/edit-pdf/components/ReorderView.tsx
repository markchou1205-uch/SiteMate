
"use client";

import React, { useEffect, useRef } from 'react';
import Sortable from 'sortablejs';

interface ReorderViewProps {
  thumbnails: string[];
  onReorder: (oldIndex: number, newIndex: number) => void;
}

const ReorderView: React.FC<ReorderViewProps> = ({ thumbnails, onReorder }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const sortableInstance = useRef<Sortable | null>(null);

  useEffect(() => {
    if (gridRef.current) {
      sortableInstance.current = Sortable.create(gridRef.current, {
        animation: 150,
        ghostClass: 'opacity-50',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            onReorder(evt.oldIndex, evt.newIndex);
          }
        },
      });
    }

    return () => {
      sortableInstance.current?.destroy();
    };
  }, [onReorder]);

  return (
    <div className="p-8 bg-muted w-full h-full overflow-y-auto">
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
      >
        {thumbnails.map((src, index) => (
          <div
            key={src + index} // Use a more unique key
            className="border-2 rounded-lg cursor-grab bg-card shadow-md transition-shadow hover:shadow-xl hover:border-primary overflow-hidden"
          >
            <img src={src} alt={`Page ${index + 1}`} className="w-full h-auto block" />
            <div className="text-center text-sm font-medium py-2 bg-card text-card-foreground">
              p. {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReorderView;
